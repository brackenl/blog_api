require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// const jwt = require("jsonwebtoken");
// const passport = require("passport");
// const jwtStrategy = require("./strategies/jwt");
// require("./passport");

// passport.use(jwtStrategy);

var Post = require("./models/post");
var Comment = require("./models/comment");
var User = require("./models/user");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var blogsRouter = require("./routes/blogs");
var authRouter = require("./routes/auth");

var app = express();

//Set up mongoose connection
var mongoose = require("mongoose");
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/blogs", blogsRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);

  // render the error page
  res.sendStatus(err.status || 500);
});

module.exports = app;
