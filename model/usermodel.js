const mongouse=require("mongoose")



// create schema

const userSchema=new mongouse.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String

    },
    bio:{
        type:String,
        default:"user"
    },
    isPremium:{
        type:Boolean,
        default:false
    }
})
const Users=mongouse.model("Users",userSchema)
module.exports=Users