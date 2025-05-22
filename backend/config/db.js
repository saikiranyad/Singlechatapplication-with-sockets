const mongoose = require("mongoose")


const connecttoDb = async()=>{
    try{
        const connection = mongoose.connect(process.env.MONGO_URI);
        console.log("Db is connected")

    }catch(err){
        console.log("db is connected at")
    }

}
module.exports = connecttoDb