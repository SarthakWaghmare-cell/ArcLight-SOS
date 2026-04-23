const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const cors = require("cors");
require("dotenv").config();

const alertRoutes = require("./routes/alertRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

// Make io accessible in controllers via req.app.get("io")
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", alertRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "ArcLight-SOS API is running." });
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);
    console.log("✅ In-memory MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 ArcLight-SOS server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

startServer();
