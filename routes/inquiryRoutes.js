const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const auth = require('../middleware/authMiddleware');

// @route   POST api/inquiries
// @desc    Submit a new inquiry
router.post('/', async (req, res) => {
  try {
    const newInquiry = new Inquiry(req.body);
    await newInquiry.save();
    res.status(201).json(newInquiry);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET api/inquiries
// @desc    Get all inquiries (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/inquiries/:id
// @desc    Delete an inquiry (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PUT api/inquiries/:id
// @desc    Update inquiry status (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    
    inquiry.status = req.body.status || inquiry.status;
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
