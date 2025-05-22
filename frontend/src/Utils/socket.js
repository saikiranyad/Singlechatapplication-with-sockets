// import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:4000"; // backend port

// export const socket = io(SOCKET_URL, {
//   withCredentials: true,
// });


import { io } from "socket.io-client";
import { backendurl } from "./Path";

const SOCKET_URL = `${backendurl}`; // backend port

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

// Add notification event listener
socket.on("notification", (notification) => {
  console.log("Notification received:", notification);
  
  // You can dispatch to Redux store or use a context to manage notifications
  // Example with Redux:
  // store.dispatch(addNotification(notification));
  
  // Or trigger a browser notification
  if (Notification.permission === "granted") {
    const title = notification.sender?.name || "New notification";
    const options = {
      body: notification.message || getNotificationMessage(notification.type),
      icon: notification.sender?.avatar || "/notification-icon.png"
    };
    
    new Notification(title, options);
  }
});

// Helper function to get notification message based on type
function getNotificationMessage(type) {
  switch (type) {
    case "message":
      return "sent you a message";
    case "like":
      return "liked your message";
    case "follow":
      return "started following you";
    default:
      return "interacted with you";
  }
}

// Example function to send a notification
export const sendSocketNotification = (receiverId, type, message) => {
  socket.emit("send notification", {
    receiverId,
    type,
    message
  });
};

// Request notification permission on client startup
export const requestNotificationPermission = () => {
  if ("Notification" in window) {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }
};
