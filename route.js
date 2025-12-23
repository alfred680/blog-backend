const express=require("express")
const usercountroller=require("./controller/userController")
const blogcontroller=require("./controller/blogcontroller")
const jwtmiddleware=require("./middleware/jwtmiddleware")

const multerConfig = require("./middleware/mullltermiddleware")
const reportcountroller=require("./controller/reportcontroller")
const adminjwtcountroller=require("./middleware/jwtadminmiddleware")


const route=new express.Router()


// register
route.post("/register",usercountroller.registercountroller)
// login
route.post("/login",usercountroller.logincontroller)
// google login
route.post("/google-login",usercountroller.googlelogin)


// add blog 
route.post("/add-blog",jwtmiddleware,multerConfig.array("uploadimg"),blogcontroller.addblogcontroller)
// get all blog
route.get("/all-blogs",jwtmiddleware,blogcontroller.getallblog)
// user blog
route.get("/user-book",jwtmiddleware,blogcontroller.getblogofuser)
//  delete blog
route.delete("/delete-blog/:id",blogcontroller.deleteblog)

// edit profile
route.put("/user-profile",jwtmiddleware,multerConfig.single("profile"),usercountroller.editUserProfile)
// edit blog
route.put("/edit-blog/:id",jwtmiddleware,blogcontroller.editblog)

// buy premiem
route.post("/buy-premium",jwtmiddleware,usercountroller.makePremiumPaymentController)
// active premiem true
route.post("/active-premiem",jwtmiddleware,usercountroller.activatePremiumController)
// get report blog
route.get("/reportblog",adminjwtcountroller,reportcountroller.getAllReports)


// report blog
route.post("/report/:id",jwtmiddleware,reportcountroller.reportBlog)
// delete blog reported
route.delete("/admindelete/:id",adminjwtcountroller,reportcountroller.deleteBlogAdmin)


route.get("/admin-allblog",jwtmiddleware,blogcontroller.getAllBlogsAdmin)

module.exports=route