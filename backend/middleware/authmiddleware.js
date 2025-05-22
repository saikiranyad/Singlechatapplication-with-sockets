const jwt = require('jsonwebtoken');


const authmiddleware = async(req,res,next)=>{
    try{
        const token = req.cookies.token ||  req.headers.authorizaton?.split(' ')[1]
        if(!token){
            return res.status(403).json({success:false,message:"unauthorized"})
        }
        jwt.verify(token,'SAIKIRAN',(err,decoded)=>{
            if(err){
                return res.status(409).json({success:false,message:"the problem is in token"})
            }
            req.user = decoded
            next();
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({success:false,message:'internal server error in authmiddleware'})
    }
}
module.exports = authmiddleware