const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    reciever:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String,
        enum:['text','image','video','audio','mixed'],
        required:true
    },
    message:{
        type:String,
        default:''
    },
    media:{
        type:[String],
        default:[]
    },
    isRead:{
        type:Boolean,
        default:false
    },

    // we do it after sometime
    isDeleted:{
        type:Boolean,
        default:false
    },
    // isDelivered:{
    //     type:Boolean,
    //     default:false
    // },
    // isSeen:{
    //     type:Boolean,
    //     default:false
    // },
    // isTyping:{
    //     type:Boolean,
    //     default:false
    // },
    // isRecording:{
    //     type:Boolean,
    //     default:false
    // },

    createdAt:{
        type:Date,
        default:Date.now
    }
},{timestamps:true})

const Message = mongoose.model('Message',messageSchema)
module.exports = Message;