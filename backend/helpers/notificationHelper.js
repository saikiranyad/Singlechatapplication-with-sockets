// const Notification = require('../models/notificationModel'); // adjust path as needed

// const sendNotification = async (fromId, toId, notificationtype, customMessage) => {
//   try {
//     const defaultMessages = {
//       friendRequest: "Friend request from the user",
//       message: "You have received a new message",
//       Like: "Your message was liked"
//     };

//     const notification = new Notification({
//       from: fromId,
//       to: toId,
//       notificationtype,
//       message: customMessage || defaultMessages[notificationtype],
//       isRead: false
//     });

//     await notification.save();
//   } catch (err) {
//     console.error("Notification error:", err);
//   }
// };

// module.exports = { sendNotification };



// This file can be used to handle notification logic on the server side

/**
 * Send a notification to a user
 * @param {string} senderId - ID of the user sending the notification
 * @param {string} receiverId - ID of the user receiving the notification
 * @param {string} type - Type of notification (message, like, follow, etc.)
 * @param {object} io - Socket.io instance
 * @param {object} additionalData - Any additional data to include in the notification
 */
const sendNotification = async (senderId, receiverId, type, io, additionalData = {}) => {
  try {
    // Get sender information from database
    const sender = await getUserById(senderId) // You'll need to implement this function
    
    // Create notification object
    const notification = {
      type,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar
      },
      ...additionalData,
      createdAt: new Date()
    }
    
    // Save notification to database if needed
    // await saveNotificationToDb(notification, receiverId)
    
    // Emit socket event
    io.to(receiverId).emit("notification", notification)
    
    return true
  } catch (error) {
    console.error("Error sending notification:", error)
    return false
  }
}

/**
 * Example implementation of getUserById
 * Replace with your actual database query
 */
const getUserById = async (userId) => {
  // This is a placeholder - replace with your actual database query
  // Example with MongoDB:
  // return await User.findById(userId).select('_id name avatar').lean()
  
  // Placeholder implementation:
  return {
    _id: userId,
    name: "User",
    avatar: "/placeholder.svg"
  }
}

module.exports = {
  sendNotification
}
