const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "blogs",
    required: true
  },
  reportedBy: {
    type: String, 
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "pending" 
  }
});

module.exports = mongoose.model("reports", reportSchema);
