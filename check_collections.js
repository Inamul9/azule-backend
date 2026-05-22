require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luciferofx:Raja9315@cluster0.0lrw669.mongodb.net/property?retryWrites=true&w=majority';
async function listCollections() {
  await mongoose.connect(MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(collections.map(c => c.name));
  
  const db = mongoose.connection.db;
  const settings = await db.collection('settings').find({}).toArray();
  console.log('Settings:', JSON.stringify(settings, null, 2));
  process.exit(0);
}
listCollections().catch(console.error);
