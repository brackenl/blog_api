var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
const { body, check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

var User = require("../models/user");

/* POST login. */
router.post(
  "/login",

  body("username", "Username required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
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
            user: { username: user.username, admin: user.admin },
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
  }
);

/* POST signup */

router.post(
  "/signup",
  [
    check("password").exists(),
    check("confirmPassword", "Password and confirmed password must match")
      .exists()
      .custom((value, { req }) => value === req.body.password),
  ],

  body("username", "Username required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

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
        admin: true, // SET TO TRUE FOR PURPOSES OF EVALUATING UX
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
            user: { username: user.username, admin: user.admin },
          });
        }
      });
    });
  }
);

module.exports = router;
