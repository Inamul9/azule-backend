const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image: { type: String, required: true },
  caption: { type: String },
  category: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
