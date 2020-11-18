var mongoose = require("mongoose");
require("dotenv").config();

var User = require("./models/user");
var Post = require("./models/post");
var Comment = require("./models/comment");

// connect to mongoDB
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var user = new User({
  username: "testuser",
  password: "password",
  posts: [],
  comments: [],
  admin: true,
});

var post = new Post({
  title: "The First Post",
  content:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  timestamp: new Date(),
  published: true,
  comments: [],
});

var comment = new Comment({
  user: user,
  comment: "First comment on the first post!",
  timestamp: new Date(),
});

const populate = async () => {
  await comment.save((err) => {
    if (err) {
      console.log(err);
    }
  });

  post.comments.push(comment);
  await post.save((err) => {
    if (err) {
      console.log(err);
    }
  });

  user.comments.push(comment);
  user.posts.push(post);
  await user.save((err) => {
    if (err) {
      console.log(err);
    }
  });
};

populate();
