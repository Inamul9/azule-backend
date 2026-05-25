const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String },
  message: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'contacted', 'resolved'] }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
