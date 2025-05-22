// import { useState, useEffect, useRef } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import {
//   FiSettings,
//   FiLogOut,
//   FiBell,
//   FiSend,
//   FiVideo,
//   FiImage,
//   FiMic,
//   FiMenu,
//   FiX,
//   FiEdit,
//   FiTrash2,
//   FiCheck,
//   FiX as FiClose,
//   FiMoreVertical,
//   FiSearch,
//   FiMessageSquare,
//   FiHeart,
//   FiUser,
// } from "react-icons/fi"
// import { useGetAllUsersExceptMeQuery, useGetMeQuery, useLogoutMutation } from "../redux/Api/userApi"
// import {
//   useGetAllMessagesQuery,
//   useSendMessageMutation,
//   useDeleteMessageMutation,
//   useUpdateMessageMutation,
// } from "../redux/Api/messageApi"
// import { socket, requestNotificationPermission } from "../Utils/socket"
// import { Link } from "react-router-dom"

// const Chatui = () => {
//   const [messages, setMessages] = useState([])
//   const [message, setMessage] = useState("")
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [isTyping, setIsTyping] = useState(false)
//   const [onlineUsers, setOnlineUsers] = useState(new Set())
//   const [editingMessage, setEditingMessage] = useState(null)
//   const [editText, setEditText] = useState("")
//   const scrollRef = useRef()
//   const [selectedFiles, setSelectedFiles] = useState([])
//   const [messageMenuOpen, setMessageMenuOpen] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [typingText, setTypingText] = useState("")
//   const [isTypingEffect, setIsTypingEffect] = useState(false)
//   const typingTimeoutRef = useRef(null)

//   // Notification states
//   const [notifications, setNotifications] = useState([])
//   const [unreadNotifications, setUnreadNotifications] = useState(0)
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false)

//   // API hooks
//   const { data: me } = useGetMeQuery()
//   const { data: users, isLoading: usersLoading } = useGetAllUsersExceptMeQuery()
//   const {
//     data: allmessages,
//     isLoading: messagesLoading,
//     refetch: refetchMessages,
//   } = useGetAllMessagesQuery(selectedUser?._id, { skip: !selectedUser })
//   const [sendMessage] = useSendMessageMutation()
//   const [deleteMessage] = useDeleteMessageMutation()
//   const [updateMessage] = useUpdateMessageMutation()

//   const remainingusers = users?.remainingusers || []
//   const userme = me?.user

//   const [logout] = useLogoutMutation()

//   // Request notification permission on component mount
//   useEffect(() => {
//     requestNotificationPermission()
//   }, [])

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   // Update messages when API data changes
//   useEffect(() => {
//     if (allmessages?.messages) {
//       setMessages(allmessages.messages)
//     }
//   }, [allmessages])

//   // Socket setup
//   useEffect(() => {
//     if (userme) {
//       // Initial socket setup
//       socket.emit("setup", userme)

//       socket.on("connected", () => {
//         console.log("Socket connected ✅")
//       })

//       // Online/Offline status
//       socket.on("user_connected", (userId) => {
//         setOnlineUsers((prev) => new Set([...prev, userId]))
//       })

//       socket.on("user_disconnected", (userId) => {
//         setOnlineUsers((prev) => {
//           const newSet = new Set([...prev])
//           newSet.delete(userId)
//           return newSet
//         })
//       })

//       // Get initial online users
//       socket.on("online_users", (users) => {
//         setOnlineUsers(new Set(users))
//       })

//       // Typing indicators
//       socket.on("typing", (userId) => {
//         if (selectedUser && userId === selectedUser._id) {
//           setIsTyping(true)
//         }
//       })

//       socket.on("stop typing", () => {
//         setIsTyping(false)
//       })

//       // Message reception
//       socket.on("message received", (newMessage) => {
//         console.log("New message received:", newMessage)

//         // Only update messages if we're in the correct chat
//         if (selectedUser && newMessage.sender._id === selectedUser._id) {
//           // Start typing effect for received message
//           startTypingEffect(newMessage)
//         }
//       })

//       // Message deletion
//       socket.on("message deleted", (messageId) => {
//         setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
//       })

//       // Message update
//       socket.on("message updated", (updatedMessage) => {
//         setMessages((prev) => prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg)))
//       })

//       // Notification reception
//       socket.on("notification", (notification) => {
//         console.log("New notification received:", notification)

//         // Play notification sound
//         const notificationSound = new Audio("../../public/notificationsound.mp3")
//         notificationSound.play().catch((err) => console.log("Error playing sound:", err))

//         // Add notification to state
//         setNotifications((prev) => {
//           // Check if this is a duplicate notification (within last 5 seconds)
//           const isDuplicate = prev.some(
//             (n) =>
//               n.sender?._id === notification.sender?._id &&
//               n.type === notification.type &&
//               new Date(notification.createdAt) - new Date(n.createdAt) < 5000,
//           )

//           if (isDuplicate) return prev
//           return [notification, ...prev]
//         })

//         // Increment unread count if not viewing notifications
//         if (!isNotificationOpen) {
//           setUnreadNotifications((prev) => prev + 1)
//         }

//         // Show notification badge animation
//         const bellIcon = document.getElementById("notification-bell")
//         if (bellIcon) {
//           bellIcon.classList.add("animate-bounce")
//           setTimeout(() => {
//             bellIcon.classList.remove("animate-bounce")
//           }, 1000)
//         }
//       })

//       // Cleanup
//       return () => {
//         socket.off("connected")
//         socket.off("user_connected")
//         socket.off("user_disconnected")
//         socket.off("online_users")
//         socket.off("typing")
//         socket.off("stop typing")
//         socket.off("message received")
//         socket.off("message deleted")
//         socket.off("message updated")
//         socket.off("notification")
//       }
//     }
//   }, [userme, selectedUser, isNotificationOpen])

//   // Join chat room when selecting a user
//   useEffect(() => {
//     if (selectedUser) {
//       socket.emit("join chat", selectedUser._id)
//     }
//   }, [selectedUser])

//   // Typing effect for received messages
//   const startTypingEffect = (newMessage) => {
//     setIsTypingEffect(true)
//     setTypingText("")

//     const fullText = newMessage.message
//     let currentIndex = 0

//     // Clear any existing typing timeout
//     if (typingTimeoutRef.current) {
//       clearInterval(typingTimeoutRef.current)
//     }

//     // Set up typing interval
//     typingTimeoutRef.current = setInterval(() => {
//       if (currentIndex < fullText.length) {
//         setTypingText((prev) => prev + fullText[currentIndex])
//         currentIndex++
//       } else {
//         clearInterval(typingTimeoutRef.current)
//         setIsTypingEffect(false)
//         // Add the complete message to the messages array
//         setMessages((prev) => [...prev, newMessage])
//       }
//     }, 30) // Adjust speed as needed
//   }

//   // Handle typing events
//   const handleTyping = () => {
//     if (!selectedUser) return

//     socket.emit("typing", selectedUser._id)

//     // Stop typing after 3 seconds of inactivity
//     clearTimeout(window.typingTimeout)
//     window.typingTimeout = setTimeout(() => {
//       socket.emit("stop typing", selectedUser._id)
//     }, 3000)
//   }

//   // Send message
//   const handleSend = async (e) => {
//     e.preventDefault()

//     if (!message.trim() && !selectedFiles.length) return
//     if (!selectedUser) return

//     try {
//       const formData = new FormData()
//       formData.append("message", message)
//       formData.append("recieverId", selectedUser._id)

//       for (let i = 0; i < selectedFiles.length; i++) {
//         formData.append("files", selectedFiles[i])
//       }

//       // Stop typing indicator when sending message
//       socket.emit("stop typing", selectedUser._id)

//       // Send message to server
//       const response = await sendMessage(formData).unwrap()

//       // Add message to local state immediately for better UX
//       const newMessage = {
//         ...response.data,
//         sender: { _id: userme._id, name: userme.name, avatar: userme.avatar },
//         reciever: { _id: selectedUser._id },
//       }

//       setMessages((prev) => [...prev, newMessage])

//       // Emit socket event with proper structure
//       socket.emit("new message", {
//         ...response.data,
//         sender: { _id: userme._id },
//         chat: {
//           users: [{ _id: userme._id }, { _id: selectedUser._id }],
//         },
//       })

//       setMessage("")
//       setSelectedFiles([])
//     } catch (error) {
//       console.error("Failed to send message:", error)
//     }
//   }

//   // Delete message
//   const handleDeleteMessage = async (messageId) => {
//     try {
//       await deleteMessage(messageId).unwrap()

//       // Update local state
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId))

//       // Notify other users
//       socket.emit("delete message", {
//         messageId,
//         receiverId: selectedUser._id,
//       })

//       // Close message menu
//       setMessageMenuOpen(null)
//     } catch (error) {
//       console.error("Failed to delete message:", error)
//     }
//   }

//   // Start editing message
//   const handleStartEdit = (msg) => {
//     setEditingMessage(msg._id)
//     setEditText(msg.message)
//     setMessageMenuOpen(null)
//   }

//   // Cancel editing
//   const handleCancelEdit = () => {
//     setEditingMessage(null)
//     setEditText("")
//   }

//   // Save edited message
//   const handleSaveEdit = async (messageId) => {
//     if (!editText.trim()) return

//     try {
//       const formData = new FormData()
//       formData.append("message", editText)

//       const response = await updateMessage({ id: messageId, formData }).unwrap()

//       // Update local state
//       setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, message: editText } : msg)))

//       // Notify other users
//       socket.emit("update message", {
//         messageId,
//         updatedMessage: { ...response.data },
//         receiverId: selectedUser._id,
//       })

//       // Reset editing state
//       setEditingMessage(null)
//       setEditText("")
//     } catch (error) {
//       console.error("Failed to update message:", error)
//     }
//   }

//   const handleLogout = async () => {
//     try {
//       await logout().unwrap()
//       window.location.href = "/login"
//     } catch (err) {
//       console.error("Logout failed:", err)
//     }
//   }

//   const handleUserSelect = (user) => {
//     setSelectedUser(user)
//     setIsSidebarOpen(false)
//     setEditingMessage(null)
//   }

//   // Check if user is online
//   const isUserOnline = (userId) => {
//     return onlineUsers.has(userId)
//   }

//   // Filter users based on search term
//   const filteredUsers = remainingusers.filter((user) => user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

//   // Toggle message menu
//   const toggleMessageMenu = (messageId) => {
//     setMessageMenuOpen(messageMenuOpen === messageId ? null : messageId)
//   }

//   // Toggle notification panel
//   const toggleNotifications = () => {
//     setIsNotificationOpen(!isNotificationOpen)
//     if (!isNotificationOpen) {
//       // Mark notifications as read when opening panel
//       setUnreadNotifications(0)
//     }
//   }

//   // Format notification time
//   const formatNotificationTime = (timestamp) => {
//     const date = new Date(timestamp)
//     const now = new Date()

//     // If today, show time
//     if (date.toDateString() === now.toDateString()) {
//       return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     }

//     // If this year, show month and day
//     if (date.getFullYear() === now.getFullYear()) {
//       return date.toLocaleDateString([], { month: "short", day: "numeric" })
//     }

//     // Otherwise show full date
//     return date.toLocaleDateString()
//   }

//   // Get notification icon based on type
//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case "message":
//         return <FiMessageSquare className="text-blue-500" size={18} />
//       case "like":
//         return <FiHeart className="text-red-500" size={18} />
//       case "follow":
//         return <FiUser className="text-green-500" size={18} />
//       default:
//         return <FiBell className="text-blue-500" size={18} />
//     }
//   }

//   // Handle notification click
//   const handleNotificationClick = (notification) => {
//     // Find the user associated with this notification
//     if (notification.sender && notification.type === "message") {
//       const notificationUser = remainingusers.find((user) => user._id === notification.sender._id)
//       if (notificationUser) {
//         handleUserSelect(notificationUser)
//         setIsNotificationOpen(false)
//       }
//     }
//   }

//   // Clear all notifications
//   const clearAllNotifications = () => {
//     setNotifications([])
//     setUnreadNotifications(0)
//   }

//   return (
//     <div className="flex h-screen flex-col md:flex-row bg-blue-50 text-gray-900">
//       {/* Sidebar */}
//       <motion.div
//         initial={{ x: "-100%" }}
//         animate={{ x: isSidebarOpen || window.innerWidth >= 768 ? 0 : "-100%" }}
//         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         className={`fixed md:static top-0 left-0 z-50 h-full w-64 bg-white border-r shadow-md transform transition-transform duration-300
//           ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         <div className="flex flex-col justify-between h-full p-4">
//           {/* Top */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h1 className="text-xl font-bold text-blue-600">ChatApp</h1>
//               <button className="p-2 md:hidden hover:bg-blue-100 rounded-full" onClick={() => setIsSidebarOpen(false)}>
//                 <FiX size={20} />
//               </button>
//             </div>

//             {/* Profile */}
//             <div className="flex items-center gap-3 mb-6">
//               <img src={userme?.avatar || "/placeholder.svg"} alt="My Profile" className="w-10 h-10 rounded-full" />
//               <div>
//                 <p className="font-semibold text-sm">{userme?.name || "You"}</p>
//                 <p className="text-xs text-green-500">Online</p>
//               </div>
//             </div>

//             {/* Search */}
//             <div className="relative mb-4">
//               <input
//                 type="text"
//                 placeholder="Search users..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-3 py-2 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
//             </div>

//             {/* Users List */}
//             <div>
//               <p className="font-semibold text-gray-700 text-sm mb-2">Chats</p>
//               {!usersLoading &&
//                 filteredUsers.map((user) => (
//                   <div
//                     key={user?._id}
//                     className={`flex items-center gap-3 mb-4 cursor-pointer hover:bg-blue-100 p-2 rounded-lg ${
//                       selectedUser?._id === user._id ? "bg-blue-100" : ""
//                     }`}
//                     onClick={() => handleUserSelect(user)}
//                   >
//                     <div className="relative">
//                       <img
//                         src={user?.avatar}
//                         alt={user?.name}
//                         className="w-10 h-10 rounded-full object-cover"
//                       />
//                       <span
//                         className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
//                           isUserOnline(user._id) ? "bg-green-500" : "bg-gray-400"
//                         }`}
//                       ></span>
//                     </div>
//                     <div>
//                       <p className="font-medium text-sm">{user?.name}</p>
//                       <p className={`text-xs ${isUserOnline(user._id) ? "text-green-500" : "text-gray-500"}`}>
//                         {isUserOnline(user._id) ? "Online" : "Offline"}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Bottom */}
//           <div className="flex flex-col gap-3 mt-4">
//             <Link to="/update" className="flex items-center gap-2 text-blue-600 hover:bg-blue-100 p-2 rounded text-sm">
//               <FiSettings size={18} />
//               Settings
//             </Link>
//             <button
//               className="flex items-center gap-2 text-red-500 hover:bg-red-100 p-2 rounded text-sm"
//               onClick={handleLogout}
//             >
//               <FiLogOut size={18} /> Logout
//             </button>
//           </div>
//         </div>
//       </motion.div>

//       {/* Chat Panel */}
//       <div className="flex-1 flex flex-col md:ml-0 ml-0">
//         {/* Top Bar */}
//         <div className="flex items-center justify-between gap-4 p-3 bg-white shadow-md border-b">
//           <div className="flex items-center gap-3">
//             <button className="md:hidden p-2 hover:bg-blue-100 rounded-full" onClick={() => setIsSidebarOpen(true)}>
//               <FiMenu size={20} />
//             </button>
//             {selectedUser ? (
//               <>
//                 <div className="relative">
//                   <img
//                     src={selectedUser.avatar || "/placeholder.svg"}
//                     alt={selectedUser.name}
//                     className="w-10 h-10 rounded-full"
//                   />
//                   <span
//                     className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
//                       isUserOnline(selectedUser._id) ? "bg-green-500" : "bg-gray-400"
//                     }`}
//                   ></span>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-sm md:text-base">{selectedUser.name}</p>
//                   <p className={`text-xs ${isUserOnline(selectedUser._id) ? "text-green-500" : "text-gray-500"}`}>
//                     {isUserOnline(selectedUser._id) ? "Online" : "Offline"}
//                   </p>
//                 </div>
//               </>
//             ) : (
//               <p className="text-sm text-gray-500">Select a user to start chatting</p>
//             )}
//           </div>

//           {/* Notification Bell */}
//           <div className="relative">
//             <button
//               id="notification-bell"
//               className="p-2 hover:bg-blue-100 rounded-full relative"
//               onClick={toggleNotifications}
//             >
//               <FiBell className="text-blue-600" size={20} />
//               {unreadNotifications > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                   {unreadNotifications > 9 ? "9+" : unreadNotifications}
//                 </span>
//               )}
//             </button>

//             {/* Notification Panel */}
//             <AnimatePresence>
//               {isNotificationOpen && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                   transition={{ duration: 0.2 }}
//                   className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl z-50"
//                 >
//                   <div className="p-3 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
//                     <h3 className="font-semibold text-gray-800">Notifications</h3>
//                     {notifications.length > 0 && (
//                       <button onClick={clearAllNotifications} className="text-xs text-blue-500 hover:text-blue-700">
//                         Clear all
//                       </button>
//                     )}
//                   </div>

//                   <div className="divide-y">
//                     {notifications.length > 0 ? (
//                       notifications.map((notification, index) => (
//                         <div
//                           key={index}
//                           className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
//                           onClick={() => handleNotificationClick(notification)}
//                         >
//                           <div className="flex items-start gap-3">
//                             <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
//                             <div className="flex-1">
//                               <div className="flex justify-between items-start">
//                                 <p className="text-sm font-medium text-gray-900">
//                                   {notification.sender?.name || "Someone"}
//                                 </p>
//                                 <span className="text-xs text-gray-500">
//                                   {formatNotificationTime(notification.createdAt || new Date())}
//                                 </span>
//                               </div>
//                               <p className="text-sm text-gray-600 mt-0.5">
//                                 {notification.type === "message"
//                                   ? "sent you a message"
//                                   : notification.type === "like"
//                                     ? "liked your message"
//                                     : notification.type === "follow"
//                                       ? "started following you"
//                                       : "interacted with you"}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="p-4 text-center text-gray-500 text-sm">No notifications yet</div>
//                     )}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
//           {selectedUser ? (
//             <>
//               {messages.map((msg, index) => (
//                 <motion.div
//                   key={msg._id || index}
//                   className={`max-w-[80%] md:max-w-[60%] p-2 md:p-3 rounded-lg shadow group relative ${
//                     msg.sender._id !== userme._id
//                       ? "bg-blue-500 text-white self-end ml-auto"
//                       : "bg-white text-gray-900 self-start mr-auto"
//                   }`}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                 >
//                   {/* Message content */}
//                   {msg?.media?.length > 0 &&
//                     msg.media.map((file, index) => {
//                       switch (msg.content) {
//                         case "image":
//                           return (
//                             <img
//                               key={index}
//                               src={file || "/placeholder.svg"}
//                               alt="message image"
//                               className="w-32 h-32 object-cover rounded-lg mb-2"
//                             />
//                           )

//                         case "video":
//                           return <video key={index} src={file} controls className="w-64 h-40 rounded-lg mb-2" />

//                         case "audio":
//                           return <audio key={index} src={file} controls className="w-64 mb-2" />

//                         default:
//                           return null
//                       }
//                     })}

//                   {/* Message text - either display as text or as editable input */}
//                   {editingMessage === msg._id ? (
//                     <div className="flex flex-col gap-2">
//                       <input
//                         type="text"
//                         value={editText}
//                         onChange={(e) => setEditText(e.target.value)}
//                         className="w-full px-2 py-1 rounded border text-gray-900"
//                         autoFocus
//                       />
//                       <div className="flex justify-end gap-2 mt-1">
//                         <button
//                           onClick={() => handleSaveEdit(msg._id)}
//                           className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600"
//                         >
//                           <FiCheck size={14} />
//                         </button>
//                         <button
//                           onClick={handleCancelEdit}
//                           className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600"
//                         >
//                           <FiClose size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <p>{msg.message}</p>
//                   )}

//                   {/* Message actions (only for user's own messages and not in edit mode) */}
//                   {msg.sender._id === userme._id && editingMessage !== msg._id && (
//                     <div className="absolute top-1 right-1">
//                       <button
//                         onClick={() => toggleMessageMenu(msg._id)}
//                         className={`p-3 rounded-full ${msg.sender._id === userme._id ? "text-white hover:bg-blue-600" : "text-gray-600 hover:bg-gray-200"}`}
//                       >
//                         <FiMoreVertical size={16} />
//                       </button>

//                       {/* Message menu dropdown */}
//                       <AnimatePresence>
//                         {messageMenuOpen === msg._id && (
//                           <motion.div
//                             initial={{ opacity: 0, scale: 0.95 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             exit={{ opacity: 0, scale: 0.95 }}
//                             className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg z-10 overflow-hidden"
//                             style={{ width: "120px" }}
//                           >
//                             <button
//                               onClick={() => handleStartEdit(msg)}
//                               className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//                             >
//                               <FiEdit size={14} /> Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteMessage(msg._id)}
//                               className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center gap-2"
//                             >
//                               <FiTrash2 size={14} /> Delete
//                             </button>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                   )}
//                 </motion.div>
//               ))}

//               {/* Typing indicator */}
//               {isTyping && (
//                 <div className="bg-gray-100 text-gray-600 p-2 rounded-lg self-start max-w-[80px]">
//                   <div className="flex space-x-1">
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "0ms" }}
//                     ></div>
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "150ms" }}
//                     ></div>
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "300ms" }}
//                     ></div>
//                   </div>
//                 </div>
//               )}

//               {/* Typing effect for received messages */}
//               {isTypingEffect && (
//                 <div className="bg-white text-gray-900 p-2 md:p-3 rounded-lg shadow self-start mr-auto max-w-[80%] md:max-w-[60%]">
//                   <p>
//                     {typingText}
//                     <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse"></span>
//                   </p>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-gray-500 text-center mt-10">No conversation selected.</div>
//           )}
//           <div ref={scrollRef}></div>
//         </div>

//         {/* Input */}
//         <form onSubmit={handleSend} className="p-3 border-t bg-white flex items-center gap-2">
//           {/* Video Upload */}
//           <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
//             <FiVideo size={20} />
//             <input type="file" accept="video/*" hidden onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
//           </label>

//           {/* Image Upload */}
//           <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
//             <FiImage size={20} />
//             <input type="file" accept="image/*" hidden onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
//           </label>

//           {/* Audio Upload */}
//           <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
//             <FiMic size={20} />
//             <input type="file" accept="audio/*" hidden onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
//           </label>

//           <input
//             type="text"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value)
//               handleTyping()
//             }}
//             placeholder="Type a message"
//             className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             disabled={!selectedUser}
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-3 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
//             disabled={!selectedUser}
//           >
//             <FiSend size={18} />
//           </button>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default Chatui








// import { useState, useEffect, useRef } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import {
//   Settings,
//   LogOut,
//   Bell,
//   Send,
//   Video,
//   ImageIcon,
//   Mic,
//   Menu,
//   X,
//   Edit,
//   Trash2,
//   Check,
//   DoorClosedIcon as Close,
//   MoreVertical,
//   Search,
//   MessageSquare,
//   Heart,
//   User,
// } from "lucide-react"
// import { useGetAllUsersExceptMeQuery, useGetMeQuery, useLogoutMutation } from "../redux/Api/userApi"
// import {
//   useGetAllMessagesQuery,
//   useSendMessageMutation,
//   useDeleteMessageMutation,
//   useUpdateMessageMutation,
// } from "../redux/Api/messageApi"
// import { socket, requestNotificationPermission } from "../Utils/socket"
// import { Link } from "react-router-dom"
// import Videocall from "../components/Videocall"
// import Callbutton from "../components/Callbutton"

// const Chatui = () => {
//   const [messages, setMessages] = useState([])
//   const [message, setMessage] = useState("")
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [isTyping, setIsTyping] = useState(false)
//   const [onlineUsers, setOnlineUsers] = useState(new Set())
//   const [editingMessage, setEditingMessage] = useState(null)
//   const [editText, setEditText] = useState("")
//   const scrollRef = useRef()
//   const [selectedFiles, setSelectedFiles] = useState([])
//   const [messageMenuOpen, setMessageMenuOpen] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [typingText, setTypingText] = useState("")
//   const [isTypingEffect, setIsTypingEffect] = useState(false)
//   const typingTimeoutRef = useRef(null)

//   // Video call states
//   const [isCallActive, setIsCallActive] = useState(false)
//   const [isCallMinimized, setIsCallMinimized] = useState(false)
//   const [incomingCall, setIncomingCall] = useState(null)

//   // Notification states
//   const [notifications, setNotifications] = useState([])
//   const [unreadNotifications, setUnreadNotifications] = useState(0)
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false)

//   // API hooks
//   const { data: me } = useGetMeQuery()
//   const { data: users, isLoading: usersLoading } = useGetAllUsersExceptMeQuery()
//   const {
//     data: allmessages,
//     isLoading: messagesLoading,
//     refetch: refetchMessages,
//   } = useGetAllMessagesQuery(selectedUser?._id, { skip: !selectedUser })
//   const [sendMessage] = useSendMessageMutation()
//   const [deleteMessage] = useDeleteMessageMutation()
//   const [updateMessage] = useUpdateMessageMutation()

//   const remainingusers = users?.remainingusers || []
//   const userme = me?.user

//   const [logout] = useLogoutMutation()

//   // Request notification permission on component mount
//   useEffect(() => {
//     requestNotificationPermission()
//   }, [])

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   // Update messages when API data changes
//   useEffect(() => {
//     if (allmessages?.messages) {
//       setMessages(allmessages.messages)
//     }
//   }, [allmessages])

//   // Socket setup
//   useEffect(() => {
//     if (userme) {
//       // Initial socket setup
//       socket.emit("setup", userme)

//       socket.on("connected", () => {
//         console.log("Socket connected ✅")
//       })

//       // Online/Offline status
//       socket.on("user_connected", (userId) => {
//         setOnlineUsers((prev) => new Set([...prev, userId]))
//       })

//       socket.on("user_disconnected", (userId) => {
//         setOnlineUsers((prev) => {
//           const newSet = new Set([...prev])
//           newSet.delete(userId)
//           return newSet
//         })
//       })

//       // Get initial online users
//       socket.on("online_users", (users) => {
//         setOnlineUsers(new Set(users))
//       })

//       // Typing indicators
//       socket.on("typing", (userId) => {
//         if (selectedUser && userId === selectedUser._id) {
//           setIsTyping(true)
//         }
//       })

//       socket.on("stop typing", () => {
//         setIsTyping(false)
//       })

//       // Message reception
//       socket.on("message received", (newMessage) => {
//         console.log("New message received:", newMessage)

//         // Only update messages if we're in the correct chat
//         if (selectedUser && newMessage.sender._id === selectedUser._id) {
//           // Start typing effect for received message
//           startTypingEffect(newMessage)
//         }
//       })

//       // Message deletion
//       socket.on("message deleted", (messageId) => {
//         setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
//       })

//       // Message update
//       socket.on("message updated", (updatedMessage) => {
//         setMessages((prev) => prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg)))
//       })

//       // Notification reception
//       socket.on("notification", (notification) => {
//         console.log("New notification received:", notification)

//         // Add notification to state
//         setNotifications((prev) => [notification, ...prev])

//         // Increment unread count if not viewing notifications
//         if (!isNotificationOpen) {
//           setUnreadNotifications((prev) => prev + 1)
//         }

//         // Show notification badge animation
//         const bellIcon = document.getElementById("notification-bell")
//         if (bellIcon) {
//           bellIcon.classList.add("animate-bounce")
//           setTimeout(() => {
//             bellIcon.classList.remove("animate-bounce")
//           }, 1000)
//         }
//       })

//       // Video call events
//       socket.on("call:incoming", (data) => {
//         setIncomingCall(data)
//       })

//       // Cleanup
//       return () => {
//         socket.off("connected")
//         socket.off("user_connected")
//         socket.off("user_disconnected")
//         socket.off("online_users")
//         socket.off("typing")
//         socket.off("stop typing")
//         socket.off("message received")
//         socket.off("message deleted")
//         socket.off("message updated")
//         socket.off("notification")
//         socket.off("call:incoming")
//       }
//     }
//   }, [userme, selectedUser, isNotificationOpen])

//   // Join chat room when selecting a user
//   useEffect(() => {
//     if (selectedUser) {
//       socket.emit("join chat", selectedUser._id)
//     }
//   }, [selectedUser])

//   // Typing effect for received messages
//   const startTypingEffect = (newMessage) => {
//     setIsTypingEffect(true)
//     setTypingText("")

//     const fullText = newMessage.message
//     let currentIndex = 0

//     // Clear any existing typing timeout
//     if (typingTimeoutRef.current) {
//       clearInterval(typingTimeoutRef.current)
//     }

//     // Set up typing interval
//     typingTimeoutRef.current = setInterval(() => {
//       if (currentIndex < fullText.length) {
//         setTypingText((prev) => prev + fullText[currentIndex])
//         currentIndex++
//       } else {
//         clearInterval(typingTimeoutRef.current)
//         setIsTypingEffect(false)
//         // Add the complete message to the messages array
//         setMessages((prev) => [...prev, newMessage])
//       }
//     }, 30) // Adjust speed as needed
//   }

//   // Handle typing events
//   const handleTyping = () => {
//     if (!selectedUser) return

//     socket.emit("typing", selectedUser._id)

//     // Stop typing after 3 seconds of inactivity
//     clearTimeout(window.typingTimeout)
//     window.typingTimeout = setTimeout(() => {
//       socket.emit("stop typing", selectedUser._id)
//     }, 3000)
//   }

//   // Send message
//   const handleSend = async (e) => {
//     e.preventDefault()

//     if (!message.trim() && !selectedFiles.length) return
//     if (!selectedUser) return

//     try {
//       const formData = new FormData()
//       formData.append("message", message)
//       formData.append("recieverId", selectedUser._id)

//       for (let i = 0; i < selectedFiles.length; i++) {
//         formData.append("files", selectedFiles[i])
//       }

//       // Stop typing indicator when sending message
//       socket.emit("stop typing", selectedUser._id)

//       // Send message to server
//       const response = await sendMessage(formData).unwrap()

//       // Add message to local state immediately for better UX
//       const newMessage = {
//         ...response.data,
//         sender: { _id: userme._id, name: userme.name, avatar: userme.avatar },
//         reciever: { _id: selectedUser._id },
//       }

//       setMessages((prev) => [...prev, newMessage])

//       // Emit socket event with proper structure
//       socket.emit("new message", {
//         ...response.data,
//         sender: { _id: userme._id },
//         chat: {
//           users: [{ _id: userme._id }, { _id: selectedUser._id }],
//         },
//       })

//       setMessage("")
//       setSelectedFiles([])
//     } catch (error) {
//       console.error("Failed to send message:", error)
//     }
//   }

//   // Delete message
//   const handleDeleteMessage = async (messageId) => {
//     try {
//       await deleteMessage(messageId).unwrap()

//       // Update local state
//       setMessages((prev) => prev.filter((msg) => msg._id !== messageId))

//       // Notify other users
//       socket.emit("delete message", {
//         messageId,
//         receiverId: selectedUser._id,
//       })

//       // Close message menu
//       setMessageMenuOpen(null)
//     } catch (error) {
//       console.error("Failed to delete message:", error)
//     }
//   }

//   // Start editing message
//   const handleStartEdit = (msg) => {
//     setEditingMessage(msg._id)
//     setEditText(msg.message)
//     setMessageMenuOpen(null)
//   }

//   // Cancel editing
//   const handleCancelEdit = () => {
//     setEditingMessage(null)
//     setEditText("")
//   }

//   // Save edited message
//   const handleSaveEdit = async (messageId) => {
//     if (!editText.trim()) return

//     try {
//       const formData = new FormData()
//       formData.append("message", editText)

//       const response = await updateMessage({ id: messageId, formData }).unwrap()

//       // Update local state
//       setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, message: editText } : msg)))

//       // Notify other users
//       socket.emit("update message", {
//         messageId,
//         updatedMessage: { ...response.data },
//         receiverId: selectedUser._id,
//       })

//       // Reset editing state
//       setEditingMessage(null)
//       setEditText("")
//     } catch (error) {
//       console.error("Failed to update message:", error)
//     }
//   }

//   const handleLogout = async () => {
//     try {
//       await logout().unwrap()
//       window.location.href = "/login"
//     } catch (err) {
//       console.error("Logout failed:", err)
//     }
//   }

//   const handleUserSelect = (user) => {
//     setSelectedUser(user)
//     setIsSidebarOpen(false)
//     setEditingMessage(null)
//   }

//   // Check if user is online
//   const isUserOnline = (userId) => {
//     return onlineUsers.has(userId)
//   }

//   // Filter users based on search term
//   const filteredUsers = remainingusers.filter((user) => user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

//   // Toggle message menu
//   const toggleMessageMenu = (messageId) => {
//     setMessageMenuOpen(messageMenuOpen === messageId ? null : messageId)
//   }

//   // Toggle notification panel
//   const toggleNotifications = () => {
//     setIsNotificationOpen(!isNotificationOpen)
//     if (!isNotificationOpen) {
//       // Mark notifications as read when opening panel
//       setUnreadNotifications(0)
//     }
//   }

//   // Format notification time
//   const formatNotificationTime = (timestamp) => {
//     const date = new Date(timestamp)
//     const now = new Date()

//     // If today, show time
//     if (date.toDateString() === now.toDateString()) {
//       return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     }

//     // If this year, show month and day
//     if (date.getFullYear() === now.getFullYear()) {
//       return date.toLocaleDateString([], { month: "short", day: "numeric" })
//     }

//     // Otherwise show full date
//     return date.toLocaleDateString()
//   }

//   // Get notification icon based on type
//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case "message":
//         return <MessageSquare className="text-blue-500" size={18} />
//       case "like":
//         return <Heart className="text-red-500" size={18} />
//       case "follow":
//         return <User className="text-green-500" size={18} />
//       default:
//         return <Bell className="text-blue-500" size={18} />
//     }
//   }

//   // Video call handlers
//   const startCall = () => {
//     setIsCallActive(true)
//   }

//   const endCall = () => {
//     setIsCallActive(false)
//     setIsCallMinimized(false)
//   }

//   const toggleCallMinimize = () => {
//     setIsCallMinimized(!isCallMinimized)
//   }

//   const acceptIncomingCall = () => {
//     socket.emit("call:accept", {
//       callerId: incomingCall.callerId,
//     })
//     setIncomingCall(null)
//     setIsCallActive(true)
//   }

//   const rejectIncomingCall = () => {
//     socket.emit("call:reject", {
//       callerId: incomingCall.callerId,
//     })
//     setIncomingCall(null)
//   }

//   return (
//     <div className="flex h-screen flex-col md:flex-row bg-blue-50 text-gray-900">
//       {/* Sidebar */}
//       <motion.div
//         initial={{ x: "-100%" }}
//         animate={{ x: isSidebarOpen || window.innerWidth >= 768 ? 0 : "-100%" }}
//         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         className={`fixed md:static top-0 left-0 z-40 h-full w-64 bg-white border-r shadow-md transform transition-transform duration-300
//           ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         <div className="flex flex-col justify-between h-full p-4">
//           {/* Top */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h1 className="text-xl font-bold text-blue-600">ChatApp</h1>
//               <button className="p-2 md:hidden hover:bg-blue-100 rounded-full" onClick={() => setIsSidebarOpen(false)}>
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Profile */}
//             <div className="flex items-center gap-3 mb-6">
//               <img src={userme?.avatar || "/placeholder.svg"} alt="My Profile" className="w-10 h-10 rounded-full" />
//               <div>
//                 <p className="font-semibold text-sm">{userme?.name || "You"}</p>
//                 <p className="text-xs text-green-500">Online</p>
//               </div>
//             </div>

//             {/* Search */}
//             <div className="relative mb-4">
//               <input
//                 type="text"
//                 placeholder="Search users..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-3 py-2 pl-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//               <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
//             </div>

//             {/* Users List */}
//             <div>
//               <p className="font-semibold text-gray-700 text-sm mb-2">Chats</p>
//               {!usersLoading &&
//                 filteredUsers.map((user) => (
//                   <div
//                     key={user?._id}
//                     className={`flex items-center gap-3 mb-4 cursor-pointer hover:bg-blue-100 p-2 rounded-lg ${
//                       selectedUser?._id === user._id ? "bg-blue-100" : ""
//                     }`}
//                     onClick={() => handleUserSelect(user)}
//                   >
//                     <div className="relative">
//                       <img
//                         src={user?.avatar || "/placeholder.svg"}
//                         alt={user?.name}
//                         className="w-10 h-10 rounded-full object-cover"
//                       />
//                       <span
//                         className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
//                           isUserOnline(user._id) ? "bg-green-500" : "bg-gray-400"
//                         }`}
//                       ></span>
//                     </div>
//                     <div>
//                       <p className="font-medium text-sm">{user?.name}</p>
//                       <p className={`text-xs ${isUserOnline(user._id) ? "text-green-500" : "text-gray-500"}`}>
//                         {isUserOnline(user._id) ? "Online" : "Offline"}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Bottom */}
//           <div className="flex flex-col gap-3 mt-4">
//             <Link to="/update" className="flex items-center gap-2 text-blue-600 hover:bg-blue-100 p-2 rounded text-sm">
//               <Settings size={18} />
//               Settings
//             </Link>
//             <button
//               className="flex items-center gap-2 text-red-500 hover:bg-red-100 p-2 rounded text-sm"
//               onClick={handleLogout}
//             >
//               <LogOut size={18} /> Logout
//             </button>
//           </div>
//         </div>
//       </motion.div>

//       {/* Chat Panel */}
//       <div className="flex-1 flex flex-col md:ml-0 ml-0">
//         {/* Top Bar */}
//         <div className="flex items-center justify-between gap-4 p-3 bg-white shadow-md border-b">
//           <div className="flex items-center gap-3">
//             <button className="md:hidden p-2 hover:bg-blue-100 rounded-full" onClick={() => setIsSidebarOpen(true)}>
//               <Menu size={20} />
//             </button>
//             {selectedUser ? (
//               <>
//                 <div className="relative">
//                   <img
//                     src={selectedUser.avatar || "/placeholder.svg"}
//                     alt={selectedUser.name}
//                     className="w-10 h-10 rounded-full"
//                   />
//                   <span
//                     className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
//                       isUserOnline(selectedUser._id) ? "bg-green-500" : "bg-gray-400"
//                     }`}
//                   ></span>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-sm md:text-base">{selectedUser.name}</p>
//                   <p className={`text-xs ${isUserOnline(selectedUser._id) ? "text-green-500" : "text-gray-500"}`}>
//                     {isUserOnline(selectedUser._id) ? "Online" : "Offline"}
//                   </p>
//                 </div>
//               </>
//             ) : (
//               <p className="text-sm text-gray-500">Select a user to start chatting</p>
//             )}
//           </div>

//           <div className="flex items-center gap-2">
//             {/* Video Call Button */}
//             {selectedUser && <Callbutton selectedUser={selectedUser} userme={userme} />}

//             {/* Notification Bell */}
//             <div className="relative">
//               <button
//                 id="notification-bell"
//                 className="p-2 hover:bg-blue-100 rounded-full relative"
//                 onClick={toggleNotifications}
//               >
//                 <Bell className="text-blue-600" size={20} />
//                 {unreadNotifications > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {unreadNotifications > 9 ? "9+" : unreadNotifications}
//                   </span>
//                 )}
//               </button>

//               {/* Notification Panel */}
//               <AnimatePresence>
//                 {isNotificationOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                     transition={{ duration: 0.2 }}
//                     className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl z-50"
//                   >
//                     <div className="p-3 border-b sticky top-0 bg-white z-10">
//                       <h3 className="font-semibold text-gray-800">Notifications</h3>
//                     </div>

//                     <div className="divide-y">
//                       {notifications.length > 0 ? (
//                         notifications.map((notification, index) => (
//                           <div key={index} className="p-3 hover:bg-gray-50 transition-colors">
//                             <div className="flex items-start gap-3">
//                               <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
//                               <div className="flex-1">
//                                 <div className="flex justify-between items-start">
//                                   <p className="text-sm font-medium text-gray-900">
//                                     {notification.sender?.name || "Someone"}
//                                   </p>
//                                   <span className="text-xs text-gray-500">
//                                     {formatNotificationTime(notification.createdAt || new Date())}
//                                   </span>
//                                 </div>
//                                 <p className="text-sm text-gray-600 mt-0.5">
//                                   {notification.type === "message"
//                                     ? "sent you a message"
//                                     : notification.type === "like"
//                                       ? "liked your message"
//                                       : notification.type === "follow"
//                                         ? "started following you"
//                                         : "interacted with you"}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="p-4 text-center text-gray-500 text-sm">No notifications yet</div>
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2">
//           {selectedUser ? (
//             <>
//               {messages.map((msg, index) => (
//                 <motion.div
//                   key={msg._id || index}
//                   className={`max-w-[80%] md:max-w-[60%] p-2 md:p-3 rounded-lg shadow group relative ${
//                     msg.sender._id === userme._id
//                       ? "bg-blue-500 text-white self-end ml-auto"
//                       : "bg-white text-gray-900 self-start mr-auto"
//                   }`}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                 >
//                   {/* Message content */}
//                   {msg?.media?.length > 0 &&
//                     msg.media.map((file, index) => {
//                       switch (msg.content) {
//                         case "image":
//                           return (
//                             <img
//                               key={index}
//                               src={file || "/placeholder.svg"}
//                               alt="message image"
//                               className="w-32 h-32 object-cover rounded-lg mb-2"
//                             />
//                           )

//                         case "video":
//                           return <video key={index} src={file} controls className="w-64 h-40 rounded-lg mb-2" />

//                         case "audio":
//                           return <audio key={index} src={file} controls className="w-64 mb-2" />

//                         default:
//                           return null
//                       }
//                     })}

//                   {/* Message text - either display as text or as editable input */}
//                   {editingMessage === msg._id ? (
//                     <div className="flex flex-col gap-2">
//                       <input
//                         type="text"
//                         value={editText}
//                         onChange={(e) => setEditText(e.target.value)}
//                         className="w-full px-2 py-1 rounded border text-gray-900"
//                         autoFocus
//                       />
//                       <div className="flex justify-end gap-2 mt-1">
//                         <button
//                           onClick={() => handleSaveEdit(msg._id)}
//                           className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600"
//                         >
//                           <Check size={14} />
//                         </button>
//                         <button
//                           onClick={handleCancelEdit}
//                           className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600"
//                         >
//                           <Close size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <p>{msg.message}</p>
//                   )}

//                   {/* Message actions (only for user's own messages and not in edit mode) */}
//                   {msg.sender._id === userme._id && editingMessage !== msg._id && (
//                     <div className="absolute top-1 right-1">
//                       <button
//                         onClick={() => toggleMessageMenu(msg._id)}
//                         className={`p-1 rounded-full ${msg.sender._id === userme._id ? "text-white hover:bg-blue-600" : "text-gray-600 hover:bg-gray-200"}`}
//                       >
//                         <MoreVertical size={16} />
//                       </button>

//                       {/* Message menu dropdown */}
//                       <AnimatePresence>
//                         {messageMenuOpen === msg._id && (
//                           <motion.div
//                             initial={{ opacity: 0, scale: 0.95 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             exit={{ opacity: 0, scale: 0.95 }}
//                             className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg z-10 overflow-hidden"
//                             style={{ width: "120px" }}
//                           >
//                             <button
//                               onClick={() => handleStartEdit(msg)}
//                               className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//                             >
//                               <Edit size={14} /> Edit
//                             </button>
//                             <button
//                               onClick={() => handleDeleteMessage(msg._id)}
//                               className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center gap-2"
//                             >
//                               <Trash2 size={14} /> Delete
//                             </button>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </div>
//                   )}
//                 </motion.div>
//               ))}

//               {/* Typing indicator */}
//               {isTyping && (
//                 <div className="bg-gray-100 text-gray-600 p-2 rounded-lg self-start max-w-[80px]">
//                   <div className="flex space-x-1">
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "0ms" }}
//                     ></div>
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "150ms" }}
//                     ></div>
//                     <div
//                       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "300ms" }}
//                     ></div>
//                   </div>
//                 </div>
//               )}

//               {/* Typing effect for received messages */}
//               {isTypingEffect && (
//                 <div className="bg-white text-gray-900 p-2 md:p-3 rounded-lg shadow self-start mr-auto max-w-[80%] md:max-w-[60%]">
//                   <p>
//                     {typingText}
//                     <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse"></span>
//                   </p>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-gray-500 text-center mt-10">No conversation selected.</div>
//           )}
//           <div ref={scrollRef}></div>
//         </div>

//         {/* Input */}
//         <form onSubmit={handleSend} className="p-3 border-t bg-white flex items-center gap-2">
//           {/* Video Upload */}
//           <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
//             <Video size={20} />
//             <input type="file" accept="video/*" hidden onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
//           </label>

//           {/* Image Upload */}
//           <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
//             <ImageIcon size={20} />
//             <input type="file" accept="image/*" hidden onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
//           </label>

//           {/* Audio Upload */}
//           <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
//             <Mic size={20} />
//             <input type="file" accept="audio/*" hidden onChange={(e) => setSelectedFiles(Array.from(e.target.files))} />
//           </label>

//           <input
//             type="text"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value)
//               handleTyping()
//             }}
//             placeholder="Type a message"
//             className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//             disabled={!selectedUser}
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-3 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
//             disabled={!selectedUser}
//           >
//             <Send size={18} />
//           </button>
//         </form>
//       </div>

//       {/* Video Call Component */}
//       {isCallActive && (
//         <VideoCall
//           selectedUser={selectedUser}
//           userme={userme}
//           onClose={endCall}
//           isMinimized={isCallMinimized}
//           onToggleMinimize={toggleCallMinimize}
//         />
//       )}

//       {/* Incoming call dialog */}
//       {incomingCall && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
//             <div className="flex items-center gap-4 mb-6">
//               <img
//                 src={incomingCall.callerAvatar || "/placeholder.svg"}
//                 alt={incomingCall.callerName}
//                 className="w-16 h-16 rounded-full"
//               />
//               <div>
//                 <h3 className="text-xl font-semibold">{incomingCall.callerName}</h3>
//                 <p className="text-gray-500">Incoming video call...</p>
//               </div>
//             </div>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={rejectIncomingCall}
//                 className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
//               >
//                 Decline
//               </button>
//               <button
//                 onClick={acceptIncomingCall}
//                 className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
//               >
//                 Accept
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Chatui



"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiSettings,
  FiLogOut,
  FiBell,
  FiSend,
  FiVideo,
  FiImage,
  FiMic,
  FiMenu,
  FiX,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX as FiClose,
  FiMoreVertical,
  FiSearch,
  FiMessageSquare,
  FiHeart,
  FiUser,
  FiPaperclip,
  FiSmile,
} from "react-icons/fi"
import { useGetAllUsersExceptMeQuery, useGetMeQuery, useLogoutMutation } from "../redux/Api/userApi"
import {
  useGetAllMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useUpdateMessageMutation,
} from "../redux/Api/messageApi"
import { socket, requestNotificationPermission } from "../Utils/socket"
import { Link } from "react-router-dom"

const Chatui = () => {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [editingMessage, setEditingMessage] = useState(null)
  const [editText, setEditText] = useState("")
  const scrollRef = useRef()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [messageMenuOpen, setMessageMenuOpen] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typingText, setTypingText] = useState("")
  const [isTypingEffect, setIsTypingEffect] = useState(false)
  const typingTimeoutRef = useRef(null)

  // Notification states
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // API hooks
  const { data: me } = useGetMeQuery()
  const { data: users, isLoading: usersLoading } = useGetAllUsersExceptMeQuery()
  const {
    data: allmessages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetAllMessagesQuery(selectedUser?._id, { skip: !selectedUser })
  const [sendMessage] = useSendMessageMutation()
  const [deleteMessage] = useDeleteMessageMutation()
  const [updateMessage] = useUpdateMessageMutation()

  const remainingusers = users?.remainingusers || []
  const userme = me?.user

  const [logout] = useLogoutMutation()

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update messages when API data changes
  useEffect(() => {
    if (allmessages?.messages) {
      setMessages(allmessages.messages)
    }
  }, [allmessages])

  // Socket setup
  useEffect(() => {
    if (userme) {
      // Initial socket setup
      socket.emit("setup", userme)

      socket.on("connected", () => {
        console.log("Socket connected ✅")
      })

      // Online/Offline status
      socket.on("user_connected", (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]))
      })

      socket.on("user_disconnected", (userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set([...prev])
          newSet.delete(userId)
          return newSet
        })
      })

      // Get initial online users
      socket.on("online_users", (users) => {
        setOnlineUsers(new Set(users))
      })

      // Typing indicators
      socket.on("typing", (userId) => {
        if (selectedUser && userId === selectedUser._id) {
          setIsTyping(true)
        }
      })

      socket.on("stop typing", () => {
        setIsTyping(false)
      })

      // Message reception
      socket.on("message received", (newMessage) => {
        console.log("New message received:", newMessage)

        // Only update messages if we're in the correct chat
        if (selectedUser && newMessage.sender._id === selectedUser._id) {
          // Start typing effect for received message
          startTypingEffect(newMessage)
        }
      })

      // Message deletion
      socket.on("message deleted", (messageId) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
      })

      // Message update
      socket.on("message updated", (updatedMessage) => {
        setMessages((prev) => prev.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg)))
      })

      // Notification reception
      socket.on("notification", (notification) => {
        console.log("New notification received:", notification)

        // Play notification sound
        const notificationSound = new Audio("../../public/comedynotificationsound.mp3")
        notificationSound.play().catch((err) => console.log("Error playing sound:", err))

        // Add notification to state
        setNotifications((prev) => {
          // Check if this is a duplicate notification (within last 5 seconds)
          const isDuplicate = prev.some(
            (n) =>
              n.sender?._id === notification.sender?._id &&
              n.type === notification.type &&
              new Date(notification.createdAt) - new Date(n.createdAt) < 5000,
          )

          if (isDuplicate) return prev
          return [notification, ...prev]
        })

        // Increment unread count if not viewing notifications
        if (!isNotificationOpen) {
          setUnreadNotifications((prev) => prev + 1)
        }

        // Show notification badge animation
        const bellIcon = document.getElementById("notification-bell")
        if (bellIcon) {
          bellIcon.classList.add("animate-bounce")
          setTimeout(() => {
            bellIcon.classList.remove("animate-bounce")
          }, 1000)
        }
      })

      // Cleanup
      return () => {
        socket.off("connected")
        socket.off("user_connected")
        socket.off("user_disconnected")
        socket.off("online_users")
        socket.off("typing")
        socket.off("stop typing")
        socket.off("message received")
        socket.off("message deleted")
        socket.off("message updated")
        socket.off("notification")
      }
    }
  }, [userme, selectedUser, isNotificationOpen])

  // Join chat room when selecting a user
  useEffect(() => {
    if (selectedUser) {
      socket.emit("join chat", selectedUser._id)
    }
  }, [selectedUser])

  // Typing effect for received messages
  const startTypingEffect = (newMessage) => {
    setIsTypingEffect(true)
    setTypingText("")

    const fullText = newMessage.message
    let currentIndex = 0

    // Clear any existing typing timeout
    if (typingTimeoutRef.current) {
      clearInterval(typingTimeoutRef.current)
    }

    // Set up typing interval
    typingTimeoutRef.current = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypingText((prev) => prev + fullText[currentIndex])
        currentIndex++
      } else {
        clearInterval(typingTimeoutRef.current)
        setIsTypingEffect(false)
        // Add the complete message to the messages array
        setMessages((prev) => [...prev, newMessage])
      }
    }, 30) // Adjust speed as needed
  }

  // Handle typing events
  const handleTyping = () => {
    if (!selectedUser) return

    socket.emit("typing", selectedUser._id)

    // Stop typing after 3 seconds of inactivity
    clearTimeout(window.typingTimeout)
    window.typingTimeout = setTimeout(() => {
      socket.emit("stop typing", selectedUser._id)
    }, 3000)
  }

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()

    if (!message.trim() && !selectedFiles.length) return
    if (!selectedUser) return

    try {
      const formData = new FormData()
      formData.append("message", message)
      formData.append("recieverId", selectedUser._id)

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i])
      }

      // Stop typing indicator when sending message
      socket.emit("stop typing", selectedUser._id)

      // Send message to server
      const response = await sendMessage(formData).unwrap()

      // Add message to local state immediately for better UX
      const newMessage = {
        ...response.data,
        sender: { _id: userme._id, name: userme.name, avatar: userme.avatar },
        reciever: { _id: selectedUser._id },
      }

      setMessages((prev) => [...prev, newMessage])

      // Emit socket event with proper structure
      socket.emit("new message", {
        ...response.data,
        sender: { _id: userme._id },
        chat: {
          users: [{ _id: userme._id }, { _id: selectedUser._id }],
        },
      })

      setMessage("")
      setSelectedFiles([])
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId).unwrap()

      // Update local state
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId))

      // Notify other users
      socket.emit("delete message", {
        messageId,
        receiverId: selectedUser._id,
      })

      // Close message menu
      setMessageMenuOpen(null)
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  // Start editing message
  const handleStartEdit = (msg) => {
    setEditingMessage(msg._id)
    setEditText(msg.message)
    setMessageMenuOpen(null)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditText("")
  }

  // Save edited message
  const handleSaveEdit = async (messageId) => {
    if (!editText.trim()) return

    try {
      const formData = new FormData()
      formData.append("message", editText)

      const response = await updateMessage({ id: messageId, formData }).unwrap()

      // Update local state
      setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, message: editText } : msg)))

      // Notify other users
      socket.emit("update message", {
        messageId,
        updatedMessage: { ...response.data },
        receiverId: selectedUser._id,
      })

      // Reset editing state
      setEditingMessage(null)
      setEditText("")
    } catch (error) {
      console.error("Failed to update message:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout().unwrap()
      window.location.href = "/login"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setIsSidebarOpen(false)
    setEditingMessage(null)
  }

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId)
  }

  // Filter users based on search term
  const filteredUsers = remainingusers.filter((user) => user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

  // Toggle message menu
  const toggleMessageMenu = (messageId) => {
    setMessageMenuOpen(messageMenuOpen === messageId ? null : messageId)
  }

  // Toggle notification panel
  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen)
    if (!isNotificationOpen) {
      // Mark notifications as read when opening panel
      setUnreadNotifications(0)
    }
  }

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()

    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    // Otherwise show full date
    return date.toLocaleDateString()
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <FiMessageSquare className="text-blue-500" size={18} />
      case "like":
        return <FiHeart className="text-red-500" size={18} />
      case "follow":
        return <FiUser className="text-green-500" size={18} />
      default:
        return <FiBell className="text-blue-500" size={18} />
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Find the user associated with this notification
    if (notification.sender && notification.type === "message") {
      const notificationUser = remainingusers.find((user) => user._id === notification.sender._id)
      if (notificationUser) {
        handleUserSelect(notificationUser)
        setIsNotificationOpen(false)
      }
    }
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadNotifications(0)
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen || window.innerWidth >= 768 ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed md:static top-0 left-0 z-50 h-full w-72 bg-white border-r shadow-lg transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col justify-between h-full">
          {/* Top */}
          <div>
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ChatApp
              </h1>
              <button
                className="p-2 md:hidden hover:bg-blue-100 rounded-full transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <FiX size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Profile */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={userme?.avatar || "/placeholder.svg?height=40&width=40"}
                    alt="My Profile"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <p className="font-semibold">{userme?.name || "You"}</p>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            {/* Users List */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 240px)" }}>
              <div className="px-4 mb-2">
                <p className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Chats</p>
              </div>

              {usersLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user?._id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedUser?._id === user._id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="relative">
                      <img
                        src={user?.avatar || "/placeholder.svg?height=40&width=40"}
                        alt={user?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isUserOnline(user._id) ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500">12:30 PM</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 truncate">Hey, how are you?</p>
                        {Math.random() > 0.7 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {Math.floor(Math.random() * 5) + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-gray-500">No users found</div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between">
              <Link
                to="/update"
                className="flex items-center gap-2 text-blue-600 hover:bg-blue-100 p-2 rounded text-sm transition-colors"
              >
                <FiSettings size={18} />
                Settings
              </Link>
              <button
                className="flex items-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded text-sm transition-colors"
                onClick={handleLogout}
              >
                <FiLogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col md:ml-0 ml-0 bg-white shadow-lg rounded-tl-xl md:rounded-tl-3xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 bg-white border-b rounded-tl-xl md:rounded-tl-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-blue-100 rounded-full transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FiMenu size={20} className="text-gray-600" />
            </button>
            {selectedUser ? (
              <>
                <div className="relative">
                  <img
                    src={selectedUser.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isUserOnline(selectedUser._id) ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                </div>
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p
                    className={`text-xs ${isUserOnline(selectedUser._id) ? "text-green-500" : "text-gray-500"} font-medium`}
                  >
                    {isUserOnline(selectedUser._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Select a user to start chatting</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedUser && (
              <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                {/* <FiVideo size={20} /> */}
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell"
                className="p-2 hover:bg-blue-100 rounded-full relative transition-colors"
                onClick={toggleNotifications}
              >
                <FiBell className="text-blue-600" size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl z-50"
                  >
                    <div className="p-3 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-xs text-blue-500 hover:text-blue-700">
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="divide-y">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 bg-blue-50 p-2 rounded-full">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.sender?.name || "Someone"}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {formatNotificationTime(notification.createdAt || new Date())}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {notification.type === "message"
                                    ? "sent you a message"
                                    : notification.type === "like"
                                      ? "liked your message"
                                      : notification.type === "follow"
                                        ? "started following you"
                                        : "interacted with you"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          <div className="inline-block p-3 bg-blue-50 rounded-full mb-2">
                            <FiBell className="text-blue-500" size={24} />
                          </div>
                          <p>No notifications yet</p>
                          <p className="text-xs mt-1">When you receive notifications, they'll appear here</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 p-4 overflow-y-auto flex flex-col gap-3"
          style={{
            backgroundImage: "url('https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6a65cb195b25fa.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {selectedUser ? (
            <>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg._id || index}
                  className={`max-w-[70%] md:max-w-[60%] p-3 rounded-lg shadow-md group relative ${
                    msg.sender._id !== userme._id
                      ? "bg-blue-500 text-white self-end ml-auto rounded-tr-none"
                      : "bg-white text-gray-900 self-start mr-auto rounded-tl-none"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Message content */}
                  {msg?.media?.length > 0 &&
                    msg.media.map((file, index) => {
                      switch (msg.content) {
                        case "image":
                          return (
                            <div className="mb-2 rounded-lg overflow-hidden">
                              <img
                                key={index}
                                src={file || "/placeholder.svg?height=200&width=200"}
                                alt="message image"
                                className="w-full max-w-xs object-cover rounded-lg"
                              />
                            </div>
                          )

                        case "video":
                          return (
                            <div className="mb-2 rounded-lg overflow-hidden">
                              <video key={index} src={file} controls className="w-full max-w-xs rounded-lg" />
                            </div>
                          )

                        case "audio":
                          return (
                            <div className="mb-2 p-2 bg-gray-100 rounded-lg">
                              <audio key={index} src={file} controls className="w-full" />
                            </div>
                          )

                        default:
                          return null
                      }
                    })}

                  {/* Message text - either display as text or as editable input */}
                  {editingMessage === msg._id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-7 py-2 rounded border text-gray-900"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => handleSaveEdit(msg._id)}
                          className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                          <FiCheck size={14} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                        >
                          <FiClose size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  )}

                  {/* Message timestamp */}
                  <div className={`text-xs mt-1 ${msg.sender._id === userme._id ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Message actions (only for user's own messages and not in edit mode) */}
                  {msg.sender._id === userme._id && editingMessage !== msg._id && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleMessageMenu(msg._id)}
                        className={`p-1 rounded-full ${
                          msg.sender._id === userme._id
                            ? "text-white hover:bg-blue-600"
                            : "text-gray-600 hover:bg-gray-200"
                        } transition-colors`}
                      >
                        <FiMoreVertical size={16} />
                      </button>

                      {/* Message menu dropdown */}
                      <AnimatePresence>
                        {messageMenuOpen === msg._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg z-10 overflow-hidden"
                            style={{ width: "120px" }}
                          >
                            <button
                              onClick={() => handleStartEdit(msg)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                            >
                              <FiEdit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                            >
                              <FiTrash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="bg-white p-3 rounded-lg shadow-md self-start max-w-[120px] flex items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">typing...</span>
                </div>
              )}

              {/* Typing effect for received messages */}
              {isTypingEffect && (
                <div className="bg-white p-3 rounded-lg shadow-md self-start mr-auto max-w-[80%] md:max-w-[60%] rounded-tl-none">
                  <p>
                    {typingText}
                    <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-pulse"></span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white bg-opacity-80 rounded-xl">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FiMessageSquare className="text-blue-500" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to ChatApp</h3>
              <p className="text-gray-600 max-w-md">
                Select a conversation from the sidebar to start chatting with your friends and colleagues.
              </p>
            </div>
          )}
          <div ref={scrollRef}></div>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t bg-white flex items-center gap-2">
          <div className="relative group">
            <button type="button" className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors">
              <FiPaperclip size={20} />
            </button>

            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2 hidden group-hover:flex flex-col gap-2 w-48">
              {/* Video Upload */}
              <label className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                <FiVideo className="text-blue-500" size={18} />
                <span className="text-sm">Video</span>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                />
              </label>

              {/* Image Upload */}
              <label className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                <FiImage className="text-blue-500" size={18} />
                <span className="text-sm">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                />
              </label>

              {/* Audio Upload */}
              <label className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                <FiMic className="text-blue-500" size={18} />
                <span className="text-sm">Audio</span>
                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                />
              </label>
            </div>
          </div>

          <button type="button" className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors">
            <FiSmile size={20} />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            placeholder="Type a message"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            disabled={!selectedUser}
          />

          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={!selectedUser}
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chatui
