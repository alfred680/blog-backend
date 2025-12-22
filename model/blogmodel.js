const mongoose=require("mongoose")

// create schema
const blogSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true

    },
    uploadimg:{
        type:Array,
        required:true
    },
    reportcontent:{
        type:String,
        default:""
    },
    premiem:{
        type:String,
        default:""
    },
    payment:{
        type:String,
        default:""
    },
    userMail:{
        type:String,
        required:true
    },
})
const blogs=mongoose.model("blogs",blogSchema)
module.exports=blogs