const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blogs",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  text: {
    type: String,
    required: true
  },

  reply: {
    text: { type: String, default: "" },
    repliedAt: { type: Date }
  }

}, { timestamps: true });

module.exports = mongoose.model("comments", commentSchema);
