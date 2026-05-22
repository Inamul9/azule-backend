require('dotenv').config();
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luciferofx:Raja9315@cluster0.0lrw669.mongodb.net/property?retryWrites=true&w=majority';
const SettingsSchema = new mongoose.Schema({}, { strict: false });
const Settings = mongoose.model('Settings', SettingsSchema);

async function checkSpecs() {
  await mongoose.connect(MONGODB_URI);
  const settingsDoc = await Settings.findOne();
  console.log(JSON.stringify(settingsDoc.get('specifications'), null, 2));
  process.exit(0);
}
checkSpecs().catch(console.error);
