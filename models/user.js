var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: { type: String, required: true, maxlength: 15 },
  password: { type: String, required: true },
  posts: { type: Schema.Types.ObjectId, ref: "Post" },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  admin: { type: Boolean, required: true },
});

//Export model
module.exports = mongoose.model("User", UserSchema);
