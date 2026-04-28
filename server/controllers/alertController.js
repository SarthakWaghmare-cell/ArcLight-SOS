const Alert = require("../models/Alert");

// POST /api/alert – Create a new alert
const createAlert = async (req, res) => {
  try {
    const { room, type, isSilent } = req.body;

    if (!room || !type) {
      return res.status(400).json({ error: "Room and emergency type are required." });
    }

    // Determine initial priority based on time and type
    let priority = "High";
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22 || type === "Security" || type === "Fire") {
      priority = "Critical";
    }

    const alert = await Alert.create({ 
      room, 
      type, 
      status: "Active",
      priority,
      isSilent: isSilent || false,
      timelineLogs: [{ status: "Triggered", note: "Initial SOS Alert Received" }]
    });

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

    if (!status || !["Active", "Pending", "Resolved", "Escalated", "Acknowledged"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required." });
    }

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        $push: { timelineLogs: { status, note: `Status manually updated to ${status}` } }
      },
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

// POST /api/alert/:id/heartbeat
const heartbeat = async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, {
      lastHeartbeatAt: new Date(),
      heartbeatStatus: 'Active'
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Heartbeat error:", err.message);
    res.status(500).json({ error: "Server error processing heartbeat." });
  }
};

// PUT /api/alert/:id/acknowledge
const acknowledgeAlert = async (req, res) => {
  try {
    const { handlerName } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: "Acknowledged",
        handlerId: handlerName || "Admin",
        $push: { timelineLogs: { status: "Acknowledged", note: `Incident handled by ${handlerName || "Admin"}` } }
      },
      { new: true }
    );

    if (!alert) return res.status(404).json({ error: "Alert not found." });

    const io = req.app.get("io");
    io.emit("alertStatusUpdate", alert);

    res.status(200).json(alert);
  } catch (err) {
    console.error("Error acknowledging alert:", err.message);
    res.status(500).json({ error: "Server error while acknowledging." });
  }
};

// GET /api/alert/:id/report
const getReport = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: "Alert not found." });

    // In a real app, this might generate a PDF. For the hackathon, returning rich JSON.
    res.status(200).json({
      title: "Incident Report",
      generatedAt: new Date(),
      data: alert
    });
  } catch (err) {
    console.error("Error fetching report:", err.message);
    res.status(500).json({ error: "Server error while generating report." });
  }
};

module.exports = { createAlert, getAlerts, updateAlertStatus, heartbeat, acknowledgeAlert, getReport };
