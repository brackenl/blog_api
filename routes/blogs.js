var express = require("express");
var router = express.Router();

const passport = require("passport");
const jwtStrategy = require("../strategies/jwt");
passport.use(jwtStrategy);

var getTokenData = require("../utils/getTokenData");

var Post = require("../models/post");

var commentRouter = require("./comments");

/* Comment routes */
router.use("/:id/comments", commentRouter);

router.use(getTokenData);

/* GET all blogs. */
router.get("/", (req, res, next) => {
  Post.find({}).exec((err, posts) => {
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
    .populate("comments")
    .exec((err, post) => {
      if (err) {
        console.log(err);
      } else {
        return res.json(post);
      }
    });
});

/* POST new blog */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    // UPDATE RE AUTHENTICATION

    const { title, content } = req.body;
    const newBlog = new Post({
      author: req.payload.id,
      title: title,
      content: content,
      timestamp: new Date(),
      published: true,
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
  (req, res, next) => {
    const { title, content } = req.body;

    Post.findById(req.params.id, (err, post) => {
      if (post.author == req.payload.id) {
        post.title = title;
        post.content = content;
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
