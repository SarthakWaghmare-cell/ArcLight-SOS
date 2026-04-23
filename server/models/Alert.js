const mongoose = require("mongoose");

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
    enum: ["Active", "Pending", "Resolved"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alert", alertSchema);
