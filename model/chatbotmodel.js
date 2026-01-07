const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  userMail: { type: String, required: true },
  qa: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true }
    }
  ]
}, { timestamps: true });


module.exports = mongoose.model("Chat", chatSchema);
