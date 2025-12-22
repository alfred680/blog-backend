const blogs = require("../model/blogmodel")


// add blog

exports.addblogcontroller = async (req, res) => {
  try {
    console.log("inside add blog");
    console.log(req.body);
    console.log(req.files);

    const { title, content, reportcontent, premiem, payment } = req.body

    // Safe image handling
    const uploadimg = req.files?.map(file => file.filename) || []

    const email = req.payload.userMail
    console.log(email);
    

    // Duplicate title check
    const existingUser = await blogs.findOne({ title, userMail:email })
    if (existingUser) {
      return res.status(400).json({ message: "duplicate title" })
    }

    const blog = new blogs({
      title,
      content,
      reportcontent,
      premiem,
      payment,
      uploadimg,
      userMail:email
    })

    await blog.save()
    res.status(200).json(blog)

  } catch (err) {
    res.status(500).json({
      error: "internal server error",
      details: err.message
    })
  }
}
// get all blogs
exports.getallblog = async (req, res) => {
  try {
    const searchkey = req.query.search || ""

    const query = {
      title: { $regex: searchkey, $options: "i" }

    }
    const allblog= await blogs.find(query)
    res.status(200).json(allblog)

  }catch(err){
    res.status(500).json({message:"servererror",error:err})
  }
 
}
  
// get user blog
exports.getblogofuser=async(req,res)=>{

  const email=req.payload.userMail
  
  try{
    const alluserblog= await blogs.find({userMail:email})
    res.status(200).json(alluserblog)
  }catch(err){
    res.status(500).json({message:"server error",error:err})
  }
}
// delete blog
exports.deleteblog = async (req, res) => {

    try {
        const { id } = req.params
        console.log(id);

        await blogs.findByIdAndDelete({ _id: id })
        res.status(200).json('Blog deleted')

    } catch (err) {

        res.status(500).json({ error: err.message })

    }

}
// edit blog
exports.editblog = async (req, res) => {
  try {
    console.log("inside edit blog");

    const { id } = req.params;
    const { title,content} = req.body;

    const email = req.payload.userMail

    
    const existingBlog = await blogs.findOne({ _id: id, userMail: email });

    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    

    // Update fields (keep old values if not provided)
    existingBlog.title = title || existingBlog.title;
    existingBlog.content = content || existingBlog.content;
  
   

    await existingBlog.save();

    res.status(200).json({existingBlog});

  } catch (err) {
    res.status(500).json({error: "internal server error",details: err.message});
  }
};

