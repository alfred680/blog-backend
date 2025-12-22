const appMiddleware = (req,res,next)=>{
    //logic
    console.log("inside application middleware");
    next()
    
}

module.exports = appMiddleware