require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luciferofx:Raja9315@cluster0.0lrw669.mongodb.net/property?retryWrites=true&w=majority';

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const settingsDoc = await db.collection('settings').findOne({});
  if (!settingsDoc || !settingsDoc.specifications) {
    console.log('No specs found');
    process.exit(0);
  }

  const newSpecs = settingsDoc.specifications.map(spec => {
    if (spec.image && spec.image.startsWith('/src/assets/')) {
      spec.image = spec.image.replace('/src/assets/', '/images/');
    }
    return spec;
  });

  await db.collection('settings').updateOne(
    { _id: settingsDoc._id },
    { $set: { specifications: newSpecs } }
  );

  console.log('Migrated raw MongoDB document');
  process.exit(0);
}

migrate().catch(console.error);
