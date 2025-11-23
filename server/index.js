import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  User  from './model/User.js';
import { Code } from './model/Code.js';
import passwordResetRoutes from "./routes/passwordReset.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", passwordResetRoutes);


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






io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on("join-room", async ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    
    // Store roomId and username in socket object
    socket.roomId = roomId;
    socket.username = username;
    
    // Broadcast to others in the same room that someone joined
    socket.to(roomId).emit("chat-message", {
      username: "System",
      text: `${username} joined the room`,
      system: true,
    });

    // Load existing code from database
    const existing = await Code.findOne({ roomId });
    if (existing) {
      socket.emit("code-update", existing.code);
    }
  });

  socket.on("code-change", async ({ roomId, code }) => {
    // Broadcast to others in the room
    socket.to(roomId).emit("code-update", code);
    
    // Optional: Save code to database
    try {
      await Code.findOneAndUpdate(
        { roomId },
        { code, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Error saving code:", err);
    }
  });

  socket.on("cursor-move", ({ roomId, username, color, position }) => {
    socket.to(roomId).emit("cursor-update", {
      username,
      color,
      position,
    });
  });

  socket.on("chat-message", ({ roomId, text, username }) => {
    console.log(`Message in ${roomId}: from ${username}`, text);
    // Broadcast message to all in the same room (except sender)
    socket.to(roomId).emit("chat-message", { text, username });
  });

  socket.on("leave-room", ({ roomId, username }) => {
    console.log(`${username} leaving room ${roomId}`);
    
    // Leave the socket.io room
    socket.leave(roomId);
    
    // Notify others in the room
    socket.to(roomId).emit("chat-message", {
      username: "System",
      text: `${username} left the room`,
      system: true,
    });
    
    // Clear socket data
    socket.roomId = null;
    socket.username = null;
  });

  // Handle disconnection (when user closes browser/tab)
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // If user was in a room, notify others
    if (socket.roomId && socket.username) {
      socket.to(socket.roomId).emit("chat-message", {
        username: "System",
        text: `${socket.username} disconnected`,
        system: true,
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("CodeColab Server is running");
});

app.get("/create-room", (req, res) => {
  const roomId = uuidv4();
  res.json({ roomId });
});

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