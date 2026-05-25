require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luciferofx:Raja9315@cluster0.0lrw669.mongodb.net/property?retryWrites=true&w=majority';

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const settingsDoc = await db.collection('settings').findOne({});
  if (!settingsDoc || !settingsDoc.specItems) {
    console.log('No specItems found');
    process.exit(0);
  }

  let updated = false;
  const newSpecs = settingsDoc.specItems.map(spec => {
    if (spec.image && spec.image.startsWith('/src/assets/')) {
      spec.image = spec.image.replace('/src/assets/', '/images/');
      updated = true;
    }
    return spec;
  });

  if (updated) {
    await db.collection('settings').updateOne(
      { _id: settingsDoc._id },
      { $set: { specItems: newSpecs } }
    );
    console.log('Migrated specItems images successfully');
  } else {
    console.log('No specItems needed migration');
  }

  process.exit(0);
}

migrate().catch(console.error);
