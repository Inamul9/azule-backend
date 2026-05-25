const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  review: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
