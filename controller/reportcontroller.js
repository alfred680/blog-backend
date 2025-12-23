const Report = require("../model/reportmodel");
const blogs = require("../model/blogmodel")
// report blog
exports.reportBlog = async (req, res) => {
  const reportedBy = req.payload.userMail;
  const blogId = req.params.id;
  const reason = req.body.reason;

  try {
    const alreadyReported = await Report.findOne({ blogId, reportedBy });
    if (alreadyReported) {
      return res.status(400).json("Already reported");
    }

    const newReport = new Report({
      blogId,
      reportedBy,
      reason
    });

    await newReport.save();
    res.status(201).json("Report submitted");
  } catch (err) {
    res.status(500).json("Server error");
  }
};

// ADMIN get all reports 
exports.getAllReports = async (req, res) => {
  try {
    const allReports = await Report.find()
      .populate("blogId")   // full blog data
      .sort({ createdAt: -1 });

    res.status(200).json(allReports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// delete blog
exports.deleteBlogAdmin = async (req, res) => {
  const blogId = req.params.id;

  try {
    const deletedBlog = await blogs.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete all reports associated with this blog
    await Report.deleteMany({ blogId: blogId });

    res.status(200).json({ message: "Blog and related reports deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};