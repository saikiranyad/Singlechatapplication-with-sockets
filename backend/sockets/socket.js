const initSocket = (server) => {
const io = require("socket.io")(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://singlechatapplication-with-sockets-d4zw.onrender.com'
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

  // Track online users
  const onlineUsers = new Set()

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id)

    socket.on("setup", (userData) => {
      if (!userData) return

      // Store user data and join personal room
      socket.userData = userData
      socket.join(userData._id)
      socket.emit("connected")

      // Add user to online users
      onlineUsers.add(userData._id)

      // Broadcast to all clients that this user is online
      io.emit("user_connected", userData._id)

      // Send the current list of online users to the newly connected user
      socket.emit("online_users", Array.from(onlineUsers))

      console.log(`User ${userData._id} setup complete`)
      console.log("Online users:", Array.from(onlineUsers))
    })

    // ===== CHAT EVENTS =====

    socket.on("typing", (room) => {
      if (!room) return

      // Forward typing event to the room
      socket.to(room).emit("typing", socket.userData?._id)
      console.log(`User ${socket.userData?._id} is typing in room ${room}`)
    })

    socket.on("stop typing", (room) => {
      if (!room) return

      // Forward stop typing event to the room
      socket.to(room).emit("stop typing")
      console.log(`User ${socket.userData?._id} stopped typing in room ${room}`)
    })

    socket.on("join chat", (room) => {
      if (!room) return

      socket.join(room)
      console.log(`User ${socket.userData?._id} joined room ${room}`)
    })

    socket.on("new message", (message) => {
      if (!message || !message.chat || !message.chat.users) {
        console.log("Invalid message format:", message)
        return
      }

      const chat = message.chat

      // Send message to all users in the chat except sender
      chat.users.forEach((user) => {
        if (user._id !== message.sender._id) {
          console.log(`Sending message to user ${user._id}`)
          socket.to(user._id).emit("message received", message)

          // Send notification for new message
          const notification = {
            type: "message",
            sender: {
              _id: socket.userData?._id,
              name: socket.userData?.name,
              avatar: socket.userData?.avatar,
            },
            message: "Sent you a message",
            createdAt: new Date(),
          }
          socket.to(user._id).emit("notification", notification)
        }
      })
    })

    // Handle message deletion
    socket.on("delete message", ({ messageId, receiverId }) => {
      if (!messageId || !receiverId) return

      console.log(`User ${socket.userData?._id} deleted message ${messageId}`)
      socket.to(receiverId).emit("message deleted", messageId)
    })

    // Handle message update
    socket.on("update message", ({ messageId, updatedMessage, receiverId }) => {
      if (!messageId || !updatedMessage || !receiverId) return

      console.log(`User ${socket.userData?._id} updated message ${messageId}`)
      socket.to(receiverId).emit("message updated", updatedMessage)
    })

    // ===== NOTIFICATION EVENTS =====

    // Handle sending notifications
    socket.on("send notification", ({ receiverId, type, message }) => {
      if (!receiverId || !type) return

      const notification = {
        type,
        sender: {
          _id: socket.userData?._id,
          name: socket.userData?.name,
          avatar: socket.userData?.avatar,
        },
        message: message || getDefaultNotificationMessage(type),
        createdAt: new Date(),
      }

      console.log(`Sending ${type} notification to user ${receiverId}`)
      socket.to(receiverId).emit("notification", notification)
    })

    // ===== VIDEO CALL EVENTS =====

    // // Handle call start
    // socket.on("call:start", ({ callerId, callerName, callerAvatar, receiverId }) => {
    //   console.log(`User ${callerId} is calling user ${receiverId}`)

    //   // Emit incoming call event to receiver
    //   socket.to(receiverId).emit("call:incoming", {
    //     callerId,
    //     callerName,
    //     callerAvatar,
    //   })
    // })

    // // Handle call acceptance
    // socket.on("call:accept", ({ callerId }) => {
    //   console.log(`Call accepted by ${socket.userData?._id} from ${callerId}`)
    //   socket.to(callerId).emit("call:accepted")
    // })

    // // Handle call rejection
    // socket.on("call:reject", ({ callerId }) => {
    //   console.log(`Call rejected by ${socket.userData?._id} from ${callerId}`)
    //   socket.to(callerId).emit("call:rejected")
    // })

    // // Handle WebRTC offer
    // socket.on("call:offer", ({ offer, callerId, receiverId }) => {
    //   console.log(`WebRTC offer from ${callerId || socket.userData?._id} to ${receiverId}`)
    //   socket.to(receiverId).emit("call:offer", {
    //     offer,
    //     callerId: callerId || socket.userData?._id,
    //   })
    // })

    // // Handle WebRTC answer
    // socket.on("call:answer", ({ answer, callerId, receiverId }) => {
    //   console.log(`WebRTC answer from ${receiverId || socket.userData?._id} to ${callerId}`)
    //   socket.to(callerId).emit("call:answer", {
    //     answer,
    //     receiverId: receiverId || socket.userData?._id,
    //   })
    // })

    // // Handle ICE candidates
    // socket.on("call:ice-candidate", ({ candidate, receiverId }) => {
    //   console.log(`ICE candidate from ${socket.userData?._id} for ${receiverId}`)
    //   socket.to(receiverId).emit("call:ice-candidate", {
    //     candidate,
    //     senderId: socket.userData?._id,
    //   })
    // })

    // // Handle call end
    // socket.on("call:end", ({ receiverId }) => {
    //   console.log(`Call ended by ${socket.userData?._id} to ${receiverId}`)
    //   socket.to(receiverId).emit("call:end")
    // })

    // // Handle video toggle
    // socket.on("call:video-toggle", ({ isEnabled, receiverId }) => {
    //   console.log(`Video ${isEnabled ? "enabled" : "disabled"} by ${socket.userData?._id}`)
    //   socket.to(receiverId).emit("call:video-toggle", {
    //     isEnabled,
    //     userId: socket.userData?._id,
    //   })
    // })

    // // Handle audio toggle
    // socket.on("call:audio-toggle", ({ isEnabled, receiverId }) => {
    //   console.log(`Audio ${isEnabled ? "enabled" : "disabled"} by ${socket.userData?._id}`)
    //   socket.to(receiverId).emit("call:audio-toggle", {
    //     isEnabled,
    //     userId: socket.userData?._id,
    //   })
    // })

    // // Handle screen sharing start
    // socket.on("call:screen-share-started", ({ receiverId }) => {
    //   console.log(`Screen sharing started by ${socket.userData?._id}`)
    //   socket.to(receiverId).emit("call:screen-share-started", {
    //     userId: socket.userData?._id,
    //   })
    // })

    // // Handle screen sharing end
    // socket.on("call:screen-share-ended", ({ receiverId }) => {
    //   console.log(`Screen sharing ended by ${socket.userData?._id}`)
    //   socket.to(receiverId).emit("call:screen-share-ended", {
    //     userId: socket.userData?._id,
    //   })
    // })

    // ===== DISCONNECT EVENT =====

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)

      // Remove user from online users if they were logged in
      if (socket.userData && socket.userData._id) {
        onlineUsers.delete(socket.userData._id)

        // Broadcast to all clients that this user is offline
        io.emit("user_disconnected", socket.userData._id)

        console.log(`User ${socket.userData._id} is now offline`)
        console.log("Online users:", Array.from(onlineUsers))
      }
    })
  })

  // Helper function to get default notification message based on type
  function getDefaultNotificationMessage(type) {
    switch (type) {
      case "message":
        return "sent you a message"
      case "like":
        return "liked your message"
      case "follow":
        return "started following you"
      default:
        return "interacted with you"
    }
  }

  return io
}

module.exports = { initSocket }

