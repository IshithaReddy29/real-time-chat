const Message = require("./models/Message");
console.log("SERVER STARTED");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db");

const app = express();
const authRoutes = require("./routes/authRoutes");

console.log("AUTH ROUTES =", authRoutes);
console.log("Starting Server...");

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://real-time-chat-beige-nine.vercel.app",
      "https://real-time-chat-9e30c9w8p-ishitha2.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

console.log(process.env.MONGO_URI);
connectDB();

app.use("/api/auth", authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://real-time-chat-beige-nine.vercel.app",
      "https://real-time-chat-9e30c9w8p-ishitha2.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// ========================
// Store Online Users
// ========================

const onlineUsers = {};
const userSockets = {};

// ========================
// Socket Connection
// ========================

io.on("connection", (socket) => {

  console.log("✅ Client Connected:", socket.id);

  console.log("User Connected");

  // ========================
  // User Joined
  // ========================

 socket.on("join", (username) => {

  
  console.log("JOIN EVENT RECEIVED:", username);

  onlineUsers[socket.id] = username;

  userSockets[username] = socket.id;

  console.log("Current Online Users:", onlineUsers);

  io.emit("onlineUsers", Object.values(onlineUsers));

});

  // ========================
  // Send Message
  // ========================

  socket.on("sendMessage", async (data) => {

  try {

    const newMessage = new Message({
    sender: data.sender,
    receiver: data.receiver,
    message: data.message,
    time: data.time,
});

console.log("Saving message:", newMessage);

await newMessage.save();

console.log("Message saved successfully!");

const senderSocket = userSockets[data.sender];
const receiverSocket = userSockets[data.receiver];

if (senderSocket) {
    io.to(senderSocket).emit("receiveMessage", data);
}

if (receiverSocket) {
    io.to(receiverSocket).emit("receiveMessage", data);
}  } catch (err) {

    console.log(err);

  }

});

// ======================
// Typing
// ======================

socket.on("typing", (username) => {

    socket.broadcast.emit("typing", username);

});

socket.on("stopTyping", () => {

    socket.broadcast.emit("stopTyping");

});
  // ========================
  // User Disconnect
  // ========================

  socket.on("disconnect", () => {

  const username = onlineUsers[socket.id];

  delete userSockets[username];

  delete onlineUsers[socket.id];

  io.emit("onlineUsers", Object.values(onlineUsers));

  console.log("User Disconnected");

});

});

// ========================
// Routes
// ========================

app.get("/", (req, res) => {
  res.send("Chat Server Running");
});

app.get("/messages", async (req, res) => {

  try {

    const { sender, receiver } = req.query;

    const messages = await Message.find({

      $or: [

        {
          sender: sender,
          receiver: receiver,
        },

        {
          sender: receiver,
          receiver: sender,
        },

      ],

    });

    res.json(messages);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }

});

// ========================
// Start Server
// ========================

server.listen(process.env.PORT, () => {

  console.log(`Server running on port ${process.env.PORT}`);

});