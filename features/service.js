const express = require("express");
const router = express.Router();

router.get("/api/service", async (req, res) => {
  res.send("Service is running");
});

module.exports = router;