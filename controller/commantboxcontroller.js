const comments = require("../model/commantbox");
const blogs = require("../model/blogmodel");

// add comment
exports.addComment = async (req, res) => {
  try {
    const { blogId, text } = req.body;

    if (!blogId || !text.trim()) {
      return res.status(400).json("BlogId and text required");
    }

    const newComment = new comments({
      blogId,
      userId: req.payload.userId,
      text
    });

    await newComment.save();
    res.status(200).json(newComment);

  } catch (err) {
    res.status(500).json(err);
  }
};


// get comments
exports.getComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    const allComments = await comments.find({ blogId })
      .populate("userId", "username profile")
      .sort({ createdAt: -1 });

    res.status(200).json(allComments);

  } catch (err) {
    res.status(500).json(err);
  }
};


// reply comments by author 
exports.replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json("Reply text is required");
    }

    const updated = await comments.findByIdAndUpdate(
      commentId,
      {
        reply: {
          text: text,
          repliedAt: new Date(),
          repliedBy: req.payload.userId
        }
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
// delete comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.payload.userId; // NOT req.user.id


    const comment = await comments.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only allow the owner to delete
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comments.findByIdAndDelete(commentId);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// delete comment by author
exports.deleteCommentauthor = async (req, res) => {
  try {
    const commentId = req.params.id;

    // Find the comment
    const comment = await comments.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Delete the comment
    await comments.findByIdAndDelete(commentId);

    return res.status(200).json({ message: "Comment deleted successfully" });

  } catch (err) {
    console.error("Delete comment error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};