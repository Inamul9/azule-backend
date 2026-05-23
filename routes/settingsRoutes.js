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
    if (req.body._id) {
      delete req.body._id;
    }
    
    if (!settings) {
      settings = new WebsiteSettings(req.body);
    } else {
      // Assign nested fields
      if (req.body.hero) settings.hero = req.body.hero;
      if (req.body.about) settings.about = req.body.about;
      if (req.body.seo) settings.seo = req.body.seo;
      if (req.body.socials) settings.socials = req.body.socials;
      if (req.body.allianceImages) settings.allianceImages = req.body.allianceImages;
      if (req.body.specifications) settings.specifications = req.body.specifications;

      // Assign flat fields
      const flatFields = ['contactTitle', 'contactNumber', 'contactEmail', 'whatsappNumber', 'address', 'reraNumber'];
      flatFields.forEach(field => {
        if (req.body[field] !== undefined) {
          settings[field] = req.body[field];
        }
      });
    }

    // Force Mongoose to recognize changes in nested objects
    settings.markModified('hero');
    settings.markModified('about');
    settings.markModified('seo');
    settings.markModified('socials');
    settings.markModified('allianceImages');
    settings.markModified('specifications');

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error("Settings Save Error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
