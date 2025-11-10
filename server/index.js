import express from 'express';
import cors from 'cors';
import {Server} from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from './model/User.js';

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MONGODB Connected"))
    .catch((err) => console.error("Connection Failed"));


import { Code } from './model/Code.js';

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        console.log(`User with ID: ${socket.id} joined room: ${roomId}`);

        const existing = await Code.findOne({ roomId });
        if (existing) {
            socket.emit("code-update", existing.code);
        }
    })
    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", code);
    })
    socket.on("chat-message", ({ roomId, text,username }) => {
    console.log(`Message in ${roomId}: from ${username}`, text);
    // broadcast message to all in the same room (except sender)
    socket.to(roomId).emit("chat-message", { text,username  });
  });
     socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.get("/", (req, res) => {
    res.send("CodeColab Server is running");
});

app.get("/create-room",(req,res)=>{
    const roomId = uuidv4();
    res.json({roomId});
})



// Login route
app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
