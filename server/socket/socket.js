const { Server } = require("socket.io");
const Message = require("../models/MessageModel"); // Assuming you have a Message model

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Adjust according to your client URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = {}; // Store connected users

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user registration
    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id; // Map user ID to socket ID
      console.log(`User registered: ${userId}`);
    });

    // Handle chat messages
    socket.on("chat_message", async (message) => {
      console.log("Received chat message:", message);
      
      const { sender, receiver } = message;

      // Save the message to MongoDB
      try {
        const savedMessage = await Message.create({
          sender,
          receiver,
          text: message.text,
          createdAt: new Date(),
        });

  

        
        socket.emit("send_message_to_user", savedMessage); // Send to sender
        if (connectedUsers[receiver]) {
          socket.to(connectedUsers[receiver]).emit("send_message_to_user", savedMessage); // Send to receiver
        }
      } catch (error) {
        console.error("Error saving message to DB:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      // Optionally remove user from connectedUsers if needed
      // You might want to loop through and remove the user
      for (const userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          console.log(`User removed: ${userId}`);
        }
      }
    });
  });

  return io;
};

module.exports = initSocket;
