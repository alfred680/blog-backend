require("dotenv").config()

const express=require("express")

const cors=require("cors")

require(`./DBConnition`)

const route=require('./route')
const appMiddleware = require("./appmiddleware")

// create server
const  blogserver=express()


blogserver.use(cors())
blogserver.use(express.json())

// blogserver.use(appMiddleware)
blogserver.use(route)
blogserver.use("/upload",express.static("./uploads"))



const PORT=process.env.PORT||4000




blogserver.get("/",(req,res)=>{
    res.status(200).send("<h1>Bookstore Server started......</h1>")
})


blogserver.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`);
    
})