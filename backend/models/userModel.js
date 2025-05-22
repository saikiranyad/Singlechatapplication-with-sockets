const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:['male','female','other']

    },
    avatar:{
        type:String,
        default:'https://iconarchive.com/download/i107195/Flat-User-Interface/Flat-User-Avatar-2.ico'
    },
    description:{
        type:String,
        default:"Hey there! I am using this app"
    },
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]


})

const User = mongoose.model('User',userSchema)
module.exports = User;
