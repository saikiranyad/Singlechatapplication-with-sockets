const cloudinary  = require('../utils/cloudinary')

const uploadimage = async(filepath)=>{
    try{
        const result = await cloudinary.uploader.upload(filepath,{resource_type:'image'})
        return {
            publicid:result.public_id,
            imageurl:result.secure_url
        }
    }catch(err){
        console.log(err)
    }
}


const videoupload = async(filepath)=>{
    try{
        const result = await cloudinary.uploader.upload(filepath,{resource_type:'video'})
        return{
            publicid:result.public_id,
            videourl:result.secure_url

        }

    }catch(err){
        console.log(err)
    }
}
const audiomedia = async(filepath)=>{
    try{
        const uploadaudio = await cloudinary.uploader.upload(filepath,{resource_type:'audio'})
        return{
            publicid:result.public_id,
            audiourl:result.secure_url
        }

    }catch(err){
        console.log(err)
    }
}

const deletemedia = async()=>{
    try{
        const deletedmedia = await cloudinary.uploader.destroy(public_id)
        console.log(deletedmedia)
        return deletedmedia

    }catch(err){
        console.log(err)
    }
}


module.exports = {uploadimage,videoupload,deletemedia,audiomedia}