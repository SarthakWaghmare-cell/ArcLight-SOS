const Alert = require("../models/Alert");

// POST /api/alert – Create a new alert
const createAlert = async (req, res) => {
  try {
    const { room, type } = req.body;

    if (!room || !type) {
      return res.status(400).json({ error: "Room and emergency type are required." });
    }

    const alert = await Alert.create({ room, type, status: "Active" });

    // Emit real-time event to all connected clients
    const io = req.app.get("io");
    io.emit("alertUpdate", alert);

    res.status(201).json(alert);
  } catch (err) {
    console.error("Error creating alert:", err.message);
    res.status(500).json({ error: "Server error while creating alert." });
  }
};

// GET /api/alerts – Fetch all alerts
const getAlerts = async (_req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err.message);
    res.status(500).json({ error: "Server error while fetching alerts." });
  }
};

// PATCH /api/alert/:id – Update alert status
const updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["Active", "Pending", "Resolved"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required (Active, Pending, Resolved)." });
    }

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: "Alert not found." });
    }

    // Emit status update to all connected clients
    const io = req.app.get("io");
    io.emit("alertStatusUpdate", alert);

    res.status(200).json(alert);
  } catch (err) {
    console.error("Error updating alert:", err.message);
    res.status(500).json({ error: "Server error while updating alert." });
  }
};

module.exports = { createAlert, getAlerts, updateAlertStatus };
