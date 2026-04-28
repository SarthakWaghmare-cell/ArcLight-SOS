const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAlerts,
  updateAlertStatus,
  heartbeat,
  acknowledgeAlert,
  getReport
} = require("../controllers/alertController");

router.post("/alert", createAlert);
router.get("/alerts", getAlerts);
router.patch("/alert/:id", updateAlertStatus);
router.post("/alert/:id/heartbeat", heartbeat);
router.put("/alert/:id/acknowledge", acknowledgeAlert);
router.get("/alert/:id/report", getReport);

module.exports = router;
