const express=require("express")
const usercountroller=require("./controller/userController")
const blogcontroller=require("./controller/blogcontroller")
const jwtmiddleware=require("./middleware/jwtmiddleware")

const multerConfig = require("./middleware/mullltermiddleware")
const reportcountroller=require("./controller/reportcontroller")
const adminjwtcountroller=require("./middleware/jwtadminmiddleware")
const chatcontroller=require("./controller/chatboxcountroller")
const commentController=require("./controller/commantboxcontroller")
const chatbotcontroller=require("./controller/chatbotcontroller")
const jwtAdminMiddleware = require("./middleware/jwtadminmiddleware")


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

// admin all blog
route.get("/admin-allblog",jwtmiddleware,blogcontroller.getAllBlogsAdmin)

route.put('/follow/:userId', jwtmiddleware,usercountroller.followUser);

// search users for starting new chats
route.get('/users/search', jwtmiddleware, usercountroller.searchUsers);

route.post("/message", jwtmiddleware,chatcontroller.sendMessage);

// Conversation endpoints
route.post("/conversations", jwtmiddleware, chatcontroller.createConversation); // create chat box using blogId
route.get("/conversations", jwtmiddleware, chatcontroller.getConversations); // list user's conversations
route.get("/conversations/:conversationId/messages", jwtmiddleware, chatcontroller.getConversationMessages); // messages within a conversation
route.delete("/conversations/:conversationId", jwtmiddleware, chatcontroller.deleteConversation); // delete conversation and its messages
route.delete("/messages/:messageId", jwtmiddleware, chatcontroller.deleteMessage); // delete single message

route.get("/blogs/:blogId/receiver",jwtmiddleware, chatcontroller.getChatReceiver);

route.get("/messages/:userId",jwtmiddleware,chatcontroller.getMessages);
// add comment
route.post("/add-comment",jwtmiddleware,commentController.addComment);
// get comments
route.get("/get-comments/:blogId", commentController.getComments);
// reply comment
route.put("/reply-comment/:commentId", jwtmiddleware,commentController.replyToComment);

// delete comment
route.delete("/comment/:id",jwtmiddleware,commentController.deleteComment);

// delete comment by author
route.delete("/comments/:id",jwtmiddleware,commentController.deleteCommentauthor)

// chatbot
route.post("/chat/answer",jwtmiddleware,chatbotcontroller.answerQuestion);



route.get("/chat/all",jwtAdminMiddleware,chatbotcontroller.getAllChats);

module.exports=route