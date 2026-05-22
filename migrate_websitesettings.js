require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luciferofx:Raja9315@cluster0.0lrw669.mongodb.net/property?retryWrites=true&w=majority';

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  
  const settingsDoc = await db.collection('websitesettings').findOne({});
  if (!settingsDoc || !settingsDoc.specifications) {
    console.log('No specifications found in websitesettings');
    process.exit(0);
  }

  let updated = false;
  const newSpecs = settingsDoc.specifications.map(spec => {
    if (spec.image && spec.image.startsWith('/src/assets/')) {
      spec.image = spec.image.replace('/src/assets/', '/images/');
      updated = true;
    }
    return spec;
  });

  if (updated) {
    await db.collection('websitesettings').updateOne(
      { _id: settingsDoc._id },
      { $set: { specifications: newSpecs } }
    );
    console.log('Migrated specifications images in websitesettings successfully');
  } else {
    console.log('No specifications needed migration in websitesettings');
  }

  process.exit(0);
}

migrate().catch(console.error);
