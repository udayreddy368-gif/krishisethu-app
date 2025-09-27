const express = require("express");
const app = express();
const PORT = 3000;

// Import routes
const livestockRoutes = require("./routes/livestock");
const grainsRoutes = require("./routes/grains");
const vegetablesRoutes = require("./routes/vegetables");

// Middleware
app.use(express.json());

// Routes
app.use("/livestock", livestockRoutes);
app.use("/grains", grainsRoutes);
app.use("/vegetables", vegetablesRoutes);

// Home page with hyperlinks
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome to KrishiSethu App</h1>
    <p>Select a category:</p>
    <ul>
      <li><a href="/livestock">Livestock</a></li>
      <li><a href="/grains">Grains (Launching soon)</a></li>
      <li><a href="/vegetables">Vegetables  (Launching soon)</a></li>
    </ul>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
