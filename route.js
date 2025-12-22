const express=require("express")
const usercountroller=require("./controller/userController")
const blogcontroller=require("./controller/blogcontroller")
const jwtmiddleware=require("./middleware/jwtmiddleware")

const multerConfig = require("./middleware/mullltermiddleware")


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

route.post("/active-premiem",jwtmiddleware,usercountroller.activatePremiumController)


module.exports=route