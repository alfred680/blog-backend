
// import mongoose

const mongoose=require("mongoose")

const connectionString=process.env.DATABASE

mongoose.connect(connectionString).then(()=>{
    console.log("MongoDB running successfully");
    
}).catch((err)=>{
    console.log("MongoDB running failed ");
    console.log(err);
    
    
})