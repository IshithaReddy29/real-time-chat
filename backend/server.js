const Message = require("./models/Message");
console.log("SERVER STARTED");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db");

const app = express();

console.log("Starting Server...");
console.log(process.env.MONGO_URI);
connectDB();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {

    console.log("User Connected");

   socket.on("sendMessage", async (data) => {

    try {

        const newMessage = new Message({
            username: data.username,
            message: data.message,
            time: data.time
        });

        await newMessage.save();

        io.emit("receiveMessage", data);

    } catch (err) {

        console.log(err);

    }

});

    socket.on("disconnect", () => {

        console.log("User Disconnected");

    });
});

app.get("/", (req, res) => {
    res.send("Chat Server Running");
});

app.get("/messages", async (req, res) => {

    try {

        const messages = await Message.find();

        res.json(messages);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});