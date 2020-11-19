var express = require("express");
var router = express.Router({ mergeParams: true });

const passport = require("passport");

var getTokenData = require("../utils/getTokenData");

var Comment = require("../models/comment");
var Post = require("../models/post");

router.use(passport.authenticate("jwt", { session: false }));
router.use(getTokenData);

/* POST new comment */
router.post("/", (req, res, next) => {
  const { comment } = req.body;

  const newComment = new Comment({
    user: req.payload.id,
    comment: comment,
    timestamp: new Date(),
    post: req.params.id,
  });

  newComment.save((err, comment) => {
    if (err) {
      console.log(err);
    } else {
      Post.findById(req.params.id, (err, post) => {
        if (err) {
          console.log(err);
        }
        post.comments.push(comment);
        post.save((err) => {
          if (err) {
            console.log(err);
          }
          res.json(comment);
        });
      });
    }
  });
});

/* DELETE new comment */
router.delete("/:commentId", async (req, res, next) => {
  Comment.findById(req.params.commentId, (err, comment) => {
    if (err) {
      console.log(err);
    }
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.user._id == req.payload.id) {
      Comment.findByIdAndDelete(req.params.commentId, (err, deletedComment) => {
        if (err) {
          console.log(err);
        }
        return res.json(deletedComment);
      });
    } else {
      return res
        .status(401)
        .json({ message: "You may only delete your own comments" });
    }
  });
});

module.exports = router;
