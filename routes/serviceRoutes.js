const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const auth = require('../middleware/authMiddleware');

// GET all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// POST new service (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// PUT update service (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedService);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// DELETE service (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
