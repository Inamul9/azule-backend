const express = require('express');
const router = express.Router();
const WebsiteSettings = require('../models/WebsiteSettings');
const auth = require('../middleware/authMiddleware');

// @route   GET api/settings
// @desc    Get all website settings
router.get('/', async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new WebsiteSettings({});
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PUT api/settings
// @desc    Update website settings
router.put('/', auth, async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
