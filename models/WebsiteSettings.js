const mongoose = require('mongoose');

const websiteSettingsSchema = new mongoose.Schema({
  // Hero Section
  hero: {
    title: { type: String, default: "Welcome to" },
    subtitle: { type: String, default: "AZULE" },
    description: { type: String, default: "Azule is a luxury residence in Siolim, Bardez—one of North Goa's most prestigious neighborhoods." },
    backgroundImage: { type: String, default: "/images/hero_premium.png" },
    coordinates: { type: String, default: "15.6322° N, 73.7711° E" },
    badge: { type: String, default: "NORTH GOA'S CROWN JEWEL" }
  },
  // Global Contacts (Requirement from user)
  contactTitle: { type: String, default: "AZULE" },
  contactNumber: { type: String, default: "+91 98917 77778" },
  contactEmail: { type: String, default: "luxehomesdelhi@gmail.com" },
  whatsappNumber: { type: String, default: "919891777778" },
  address: { type: String, default: "Survey No. 213/4, Sodiem Siolim, Bardez, North Goa - 403517" },
  
  // About Section (Redesigned)
  about: {
    heading: { type: String, default: "The Soul of Goa" },
    description: { type: String, default: "Experience the pinnacle of tropical luxury with our expansive signature residences." }
  },
  
  // Specifications
  specifications: [{
    title: { type: String },
    image: { type: String },
    details: [{ type: String }]
  }],

  // SEO Settings
  seo: {
    metaTitle: { type: String, default: "AZULE | Luxury Residences Goa" },
    metaDescription: { type: String, default: "Luxury boutique residences in Siolim, North Goa." },
    keywords: { type: String, default: "luxury real estate, goa, siolim, residences, pool villas" }
  },
  
  // Footer Links & Socials
  socials: {
    instagram: { type: String, default: "https://instagram.com" },
    facebook: { type: String, default: "https://facebook.com" },
    linkedin: { type: String, default: "https://linkedin.com" },
    youtube: { type: String, default: "https://youtube.com" }
  },
  reraNumber: { type: String, default: "PRGO10252558" }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteSettings', websiteSettingsSchema);
