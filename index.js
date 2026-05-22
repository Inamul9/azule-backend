const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luciferofx:Raja9315@cluster0.0lrw669.mongodb.net/property?retryWrites=true&w=majority';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
    cachedDb = db;
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Connect immediately, but also ensure connection is alive on routes
connectToDatabase().catch(console.error);

// Middleware to ensure DB connection before handling requests (Serverless fix)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Seed Default Admin
const Admin = require('./models/Admin');
const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'sinu' });
    if (!adminExists) {
      const newAdmin = new Admin({
        username: 'sinu',
        password: 'sinu' // Will be hashed by pre-save hook
      });
      await newAdmin.save();
      console.log('Default admin seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
};
seedAdmin();

app.get('/', (req, res) => {
  res.send('AZULE Backend API is running...');
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
