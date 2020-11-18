var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

var User = require("../models/user");

// ADD ROUTES

/* POST login. */
router.post("/login", (req, res, next) => {
  var { username, password } = req.body;

  User.findOne({ username }, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        const token = jwt.sign(
          { username, id: user._id },
          process.env.JWT_SECRET,
          {
            expiresIn: 1800,
          }
        );
        return res.status(200).json({
          message: "Auth Passed",
          token,
        });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    });

    if (user) {
    } else {
      return res.status(401).json({ message: "Auth Failed" });
    }
  });
});

/* POST signup */

router.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      console.log(err);
    }
    var user = new User({
      username,
      password: hash,
      posts: [],
      comments: [],
      admin: true, // TBD how to deal with this
    });
    user.save((err, user) => {
      if (err) {
        console.log(err);
      } else {
        const token = jwt.sign(
          { username, id: user._id },
          process.env.JWT_SECRET,
          {
            expiresIn: 1800,
          }
        );
        return res.status(200).json({
          message: "Sign up successful",
          token,
        });
      }
    });
  });
});

module.exports = router;
