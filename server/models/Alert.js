const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String }
});

const alertSchema = new mongoose.Schema({
  room: {
    type: String,
    required: [true, "Room number is required"],
    trim: true,
  },
  type: {
    type: String,
    required: [true, "Emergency type is required"],
    enum: ["Fire", "Medical", "Security", "Other"],
  },
  status: {
    type: String,
    enum: ["Active", "Pending", "Resolved", "Escalated", "Acknowledged"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // NEW ADVANCED FIELDS
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'High'
  },
  handlerId: { 
    type: String, // Can be user ID or name for hackathon purposes
    default: null 
  },
  timelineLogs: [timelineSchema],
  heartbeatStatus: {
    type: String,
    enum: ['Active', 'Unresponsive', 'Offline'],
    default: 'Active'
  },
  lastHeartbeatAt: { type: Date, default: Date.now },
  isSilent: { type: Boolean, default: false },
  trackingModeActive: { type: Boolean, default: false }
});

module.exports = mongoose.model("Alert", alertSchema);
