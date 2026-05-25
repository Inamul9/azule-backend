const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/authMiddleware');

// GET all gallery items
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// POST new gallery item (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const newItem = new Gallery(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// DELETE gallery item (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
