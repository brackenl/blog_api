var express = require("express");
var router = express.Router();

const { body, check, validationResult } = require("express-validator");

const passport = require("passport");
const jwtStrategy = require("../strategies/jwt");
passport.use(jwtStrategy);

var getTokenData = require("../utils/getTokenData");

var Post = require("../models/post");

var commentRouter = require("./comments");

/* Comment routes */
router.use("/:id/comments", commentRouter);

// router.use(getTokenData);

/* GET all blogs. */
router.get("/", (req, res, next) => {
  Post.find({})
    .populate("author")
    .exec((err, posts) => {
      if (err) {
        console.log(err);
      } else {
        return res.json(posts);
      }
    });
});

/* GET specific blog. */
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id)
    .populate("author")
    .populate({
      path: "comments",
      model: "Comment",
      populate: {
        path: "user",
        model: "User",
      },
    })
    .exec((err, post) => {
      if (err) {
        console.log(err);
      } else {
        if (post.published) {
          return res.json(post);
        } else {
          return res.status(404).send();
        }
      }
    });
});

/* POST new blog */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  getTokenData,

  body("title", "Title required").trim().isLength({ min: 1 }).escape(),
  body("content", "Content required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const newBlog = new Post({
      author: req.payload.id,
      title: title,
      content: content,
      timestamp: new Date(),
      published: false,
      comments: [],
    });
    newBlog.save((err, data) => {
      if (err) {
        console.log(err);
      }
      res.json(data);
    });
  }
);

/* PUT update blog */
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  getTokenData,
  (req, res, next) => {
    const { title, content, published } = req.body;

    Post.findById(req.params.id, (err, post) => {
      if (post.author == req.payload.id) {
        post.title = title;
        post.content = content;
        post.published = published;
        post.save((err, data) => {
          if (err) {
            console.log(err);
          }
          return res.json(data);
        });
      } else {
        return res
          .status(401)
          .json({ message: "You may only update your own posts" });
      }
    });
  }
);

/* DELETE blog */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  getTokenData,
  (req, res, next) => {
    Post.findById(req.params.id, (err, post) => {
      if (post.author == req.payload.id) {
        Post.findByIdAndDelete(req.params.id, (err, post) => {
          if (err) {
            console.log(err);
          }
          res.json(post);
        });
      } else {
        return res
          .status(401)
          .json({ message: "You may only delete your own posts" });
      }
    });
  }
);

module.exports = router;
