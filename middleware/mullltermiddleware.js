// import multer
const multer=require("multer")

// create disk Storage

const storage=multer.diskStorage({

    destination:(req,file,callback)=>{

        callback(null,'./uploads')

    },
    filename:(req,file,callback)=>{

        callback(null,`image-${file.originalname}`)

    }

})

const fileFilter=(req,file,callback)=>{

    if(file.mimetype=='image/png' || file.mimetype=='image/jpg' || file.mimetype=='image/jpeg'){
        callback(null,true)
    }else{
        callback(null,false)
        return callback(new Error('accept only png,jpg,jpeg file types'))
        
    }

}

const multerConfig=multer({
    storage,
    fileFilter
})

module.exports=multerConfig