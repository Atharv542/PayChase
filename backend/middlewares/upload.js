const multer= require('multer')
const storage= multer.memoryStorage();

const upload= multer({
    storage,
    limits:{fileSize:2*1024*1024},
    fileFilter:(req,file,cb)=>{
        const ok= ['image/png','image/jpeg','image/jpg','image/webp'].includes(file.mimetype)
        if(!ok) return cb(new Error("png/jpg/jpeg/webp allowed"))
        cb(null,true)
    }
})

module.exports=upload;