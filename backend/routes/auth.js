const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// GET login - informational (for the Sign In link)
router.get('/login', (req, res) => {
  res.json({ 
    message: 'Please use POST to /api/auth/login with email/phone, password, and role.' 
  });
});

// GET register - informational (for the Sign Up link)
router.get('/register', (req, res) => {
  res.json({ 
    message: 'Please use POST to /api/auth/register with name, phone, email, password, role, etc.' 
  });
});

// Sign Up - Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role, address, village, business_name } = req.body;

    // Check if user already exists
    if (role === 'farmer') {
      const existingUser = await db.get('SELECT * FROM farmers WHERE phone = ? OR email = ?', [phone, email]);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this phone or email' });
      }
    } else {
      const existingUser = await db.get('SELECT * FROM buyers WHERE phone = ? OR email = ?', [phone, email]);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this phone or email' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let result;
    if (role === 'farmer') {
      // Insert into farmers table
      result = await db.run(
        `INSERT INTO farmers (name, phone, email, password, address, village) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, phone, email, hashedPassword, address, village]
      );
    } else {
      // Insert into buyers table
      result = await db.run(
        `INSERT INTO buyers (name, phone, email, password, business_name, address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, phone, email, hashedPassword, business_name, address]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: result.id, role: role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.id,
        name,
        email,
        phone,
        role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Sign In - Login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password, role } = req.body;

    let user;
    if (role === 'farmer') {
      // Check farmers table
      if (email) {
        user = await db.get('SELECT * FROM farmers WHERE email = ?', [email]);
      } else if (phone) {
        user = await db.get('SELECT * FROM farmers WHERE phone = ?', [phone]);
      }
    } else {
      // Check buyers table
      if (email) {
        user = await db.get('SELECT * FROM buyers WHERE email = ?', [email]);
      } else if (phone) {
        user = await db.get('SELECT * FROM buyers WHERE phone = ?', [phone]);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    let user;
    if (decoded.role === 'farmer') {
      user = await db.get('SELECT id, name, email, phone, address, village FROM farmers WHERE id = ?', [decoded.id]);
    } else {
      user = await db.get('SELECT id, name, email, phone, business_name, address FROM buyers WHERE id = ?', [decoded.id]);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user, role: decoded.role });

  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;