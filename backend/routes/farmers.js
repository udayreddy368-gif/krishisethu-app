const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { farmerValidation } = require('../middleware/validation');

// Register farmer
router.post('/register', farmerValidation, async (req, res) => {
  try {
    const { password, ...farmerData } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const farmer = await dbService.createFarmer({
      ...farmerData,
      password: hashedPassword
    });
    
    // Generate JWT
    const token = jwt.sign(
      { id: farmer.id, role: 'farmer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ farmer, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login farmer
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const farmer = await dbService.getFarmerByPhone(phone);
    if (!farmer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, farmer.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: farmer.id, role: 'farmer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    delete farmer.password;
    res.json({ farmer, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await dbService.getAllFarmers();
    // Remove passwords from response
    farmers.forEach(f => delete f.password);
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;