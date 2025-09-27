// routes/livestock.js
const express = require('express');
const router = express.Router();

// Example livestock data
const livestockData = [
  { id: 1, type: 'Sheep', count: 50 },
  { id: 2, type: 'Goat', count: 30 },
  { id: 3, type: 'Hen', count: 200 }
];

// GET /livestock
router.get('/', (req, res) => {
  res.json(livestockData);
});

module.exports = router;
