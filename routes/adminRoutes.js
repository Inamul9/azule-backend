const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/authMiddleware');

// @route   POST api/admin/login
// @desc    Authenticate admin & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: admin._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'azule_luxury_secret_key_2026', { expiresIn: '1d' });

    res.json({ token, admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   PUT api/admin/change-password
// @desc    Change admin password
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.admin.id);
    const isMatch = await admin.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
