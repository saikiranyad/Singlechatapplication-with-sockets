const { uploadimage, videoupload, audiomedia } = require("../helpers/cloudinaryhelper");
const { sendNotification } = require("../helpers/notificationHelper");
const Message = require("../models/messageModel")


// const sendmessage = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { message,recieverId } = req.body;
   
//     const files = req.files;
//     let mediaUrls = [];
//     let types = new Set();

//     if (files && files.length > 0) {
//       for (const file of files) {
//         const fileType = file.mimetype.split('/')[0];

//         if (fileType === 'image') {
//           const result = await uploadimage(file.path);
//           mediaUrls.push(result.imageurl);
//           types.add('image');
//         } else if (fileType === 'video') {
//           const result = await videoupload(file.path);
//           mediaUrls.push(result.videourl);
//           types.add('video');
//         } else if (fileType === 'audio') {
//           const result = await audiomedia(file.path);
//           mediaUrls.push(result.audiourl);
//           types.add('audio');
//         } else {
//           return res.status(400).json({ success: false, message: "Unsupported file type" });
//         }
//       }
//     }

//     let contentType = 'text';
//     if (types.size === 1) {
//       contentType = [...types][0];
//     } else if (types.size > 1) {
//       contentType = 'mixed';
//     }

//     const messageData = new Message({
//       sender: userId,
//       reciever: recieverId,
//       content: contentType,
//       message,
//       media: mediaUrls
//     });

//     const newMessage = await messageData.save();
//      await sendNotification(userId, recieverId, 'message');
//     return res.status(200).json({
//       success: true,
//       message: "Message sent successfully",
//       data: newMessage
//     });

//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ success: false, message: "Internal Server Error in sendmessage" ,err});
//   }
// };

// This is how you would modify your sendmessage function to use the socket for notifications

const sendmessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, recieverId } = req.body;
   
    const files = req.files;
    let mediaUrls = [];
    let types = new Set();

    // Declare uploadimage, videoupload, audiomedia, Message, and sendNotification variables


    if (files && files.length > 0) {
      for (const file of files) {
        const fileType = file.mimetype.split('/')[0];

        if (fileType === 'image') {
          const result = await uploadimage(file.path);
          mediaUrls.push(result.imageurl);
          types.add('image');
        } else if (fileType === 'video') {
          const result = await videoupload(file.path);
          mediaUrls.push(result.videourl);
          types.add('video');
        } else if (fileType === 'audio') {
          const result = await audiomedia(file.path);
          mediaUrls.push(result.audiourl);
          types.add('audio');
        } else {
          return res.status(400).json({ success: false, message: "Unsupported file type" });
        }
      }
    }

    let contentType = 'text';
    if (types.size === 1) {
      contentType = [...types][0];
    } else if (types.size > 1) {
      contentType = 'mixed';
    }

    const messageData = new Message({
      sender: userId,
      reciever: recieverId,
      content: contentType,
      message,
      media: mediaUrls
    });

    const newMessage = await messageData.save();
    
    // Send notification using socket instead of a separate function
    // This assumes you have access to the io instance
    // If not, you can still use your sendNotification function
    const io = req.app.get('io'); // This assumes you've attached io to your Express app
    
    if (io) {
      // Use socket for real-time notification
      const notification = {
        type: 'message',
        sender: {
          _id: userId,
          name: req.user.name, // Assuming user info is in req.user
          avatar: req.user.avatar
        },
        message: message.length > 30 ? message.substring(0, 30) + '...' : message,
        createdAt: new Date()
      };
      
      io.to(recieverId).emit('notification', notification);
    } else {
      // Fallback to your existing method
      await sendNotification(userId, recieverId, 'message');
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Internal Server Error in sendmessage", err });
  }
};




const getallmessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const recieverId = req.params.id;
        console.log(recieverId)

        const messages = await Message.find({
            $or: [
                { sender: userId, reciever: recieverId },
                { sender: recieverId, reciever: userId }
            ]
        }).populate('sender reciever', 'name email avatar');

        return res.status(200).json({
            success: true,
            message: "All messages between the two users",
            messages
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error in getallmessage"
        });
    }
};

const getmessagebyid = async (req, res) => {
    try {
        const userId = req.user.id
        const messageId = req.params.id
        const message = await Message.findById(messageId).populate('sender reciever', 'name email avatar')
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" })
        }
        if (message.sender._id.toString() !== userId && message.reciever._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to view this message" })
        }
        return res.status(200).json({ success: true, message: "Message found", message })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal Server Error in getmessagebyid" })
    }
}


// NEW: Delete message
const deletemessage = async (req, res) => {
  try {
    const userId = req.user.id
    const messageId = req.params.id

    // Find the message
    const message = await Message.findById(messageId)

    // Check if message exists
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    // Check if user is the sender of the message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      })
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId)

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in deletemessage",
    })
  }
}

// NEW: Update message
const updatemessage = async (req, res) => {
  try {
    const userId = req.user.id
    const messageId = req.params.id
    const { message } = req.body

    // Find the message
    const existingMessage = await Message.findById(messageId)

    // Check if message exists
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    // Check if user is the sender of the message
    if (existingMessage.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own messages",
      })
    }

    // Update the message
    existingMessage.message = message
    existingMessage.updatedAt = Date.now()

    const updatedMessage = await existingMessage.save()

    // Populate sender and receiver
    await updatedMessage.populate("sender reciever", "name email avatar")

    return res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in updatemessage",
    })
  }
}

const isReadmessage = async (req, res) => {
    try {
        const userId = req.user.id
        const messageId = req.params.id
        const message = await Message.findById(messageId)
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" })
        }
        if (message.sender._id.toString() !== userId && message.reciever._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to mark this message as read" })
        }
        if (message.isRead) {
            return res.status(400).json({ success: false, message: "Message already marked as read" })
        }
        message.isRead = true
        await message.save()
        return res.status(200).json({ success: true, message: "Message marked as read successfully", message })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Internal Server Error in isReadmessage" })
    }
}


module.exports = {
    sendmessage,
    getallmessage,
    getmessagebyid,
    deletemessage,
    updatemessage,
    isReadmessage
}