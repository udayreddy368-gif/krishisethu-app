// routes/grains.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Grains module coming soon! good things takes time");
});

module.exports = router;
