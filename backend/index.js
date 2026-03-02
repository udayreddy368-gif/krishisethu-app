const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database and models
const { initializeDatabase } = require('./models/schema');

// Import routes
const livestockRoutes = require('./routes/livestock');
const grainsRoutes = require('./routes/grains');
const vegetablesRoutes = require('./routes/vegetables');
const farmersRoutes = require('./routes/farmers');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ========== INITIALIZE DATABASE ==========
initializeDatabase().catch(console.error);

// ========== ROUTES ==========
app.use('/api/livestock', livestockRoutes);
app.use('/api/grains', grainsRoutes);
app.use('/api/vegetables', vegetablesRoutes);
app.use('/api/farmers', farmersRoutes);

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ========== HOME PAGE ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== ERROR HANDLING ==========
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 KrishiSethu Server Started!
  ===============================
  📡 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  📁 Uploads: ${path.join(__dirname, 'uploads')}
  🗄️  Database: SQLite
  ===============================
  `);
});

module.exports = app;