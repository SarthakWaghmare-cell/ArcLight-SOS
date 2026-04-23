const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAlerts,
  updateAlertStatus,
} = require("../controllers/alertController");

router.post("/alert", createAlert);
router.get("/alerts", getAlerts);
router.patch("/alert/:id", updateAlertStatus);

module.exports = router;
