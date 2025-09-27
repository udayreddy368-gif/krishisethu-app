// routes/grains.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Grains module coming soon!");
});

module.exports = router;
