const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS — allow frontend domain (set FRONTEND_URL env var on Render) ───────
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || '*').split(',').map(s => s.trim());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Set up body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Admin credentials from env (fallback to defaults for local dev)
const ADMIN_USER = process.env.ADMIN_USER || 'sinu';
const ADMIN_PASS = process.env.ADMIN_PASS || 'sinu';



// ─── JWT Implementation (no external deps) ────────────────────────────────
// Generate a persistent secret saved in a local file so nodemon restarts do not log out the user
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  const secretDir = path.join(__dirname, 'data');
  const secretFile = path.join(secretDir, '.jwt_secret');
  try {
    if (!fs.existsSync(secretDir)) {
      fs.mkdirSync(secretDir, { recursive: true });
    }
    if (fs.existsSync(secretFile)) {
      JWT_SECRET = fs.readFileSync(secretFile, 'utf8').trim();
    } else {
      JWT_SECRET = crypto.randomBytes(64).toString('hex');
      fs.writeFileSync(secretFile, JWT_SECRET, 'utf8');
    }
  } catch (err) {
    console.error('Error with JWT secret file:', err);
    JWT_SECRET = crypto.randomBytes(64).toString('hex'); // fallback
  }
}
const JWT_EXPIRY_HOURS = 24;

const base64url = (str) =>
  Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const signJWT = (payload) => {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = base64url(JSON.stringify(payload));
  const sig    = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
};

const verifyJWT = (token) => {
  if (!token) return null;
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64')
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const sigBuffer = Buffer.from(sig);
    const expectedSigBuffer = Buffer.from(expectedSig);
    // timingSafeEqual requires buffer lengths to match
    if (sigBuffer.length !== expectedSigBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    if (Date.now() > payload.exp) return null; // expired
    return payload;
  } catch {
    return null;
  }
};

// Helper to parse cookies from requests
const parseCookies = (req) => {
  const cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      cookies[parts[0].trim()] = (parts.slice(1).join('=')).trim();
    });
  }
  return cookies;
};

// Check if request is authenticated
const checkAuth = (req) => {
  const cookies = parseCookies(req);
  if (cookies.admin_jwt && verifyJWT(cookies.admin_jwt)) {
    return true;
  }
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      if (verifyJWT(parts[1])) return true;
    }
  }
  if (req.query && req.query.token) {
    if (verifyJWT(req.query.token)) return true;
  }
  return false;
};

// Authentication Middleware (redirects for pages)
const authMiddleware = (req, res, next) => {
  if (checkAuth(req)) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// API Authentication Middleware (returns JSON instead of redirecting)
const apiAuthMiddleware = (req, res, next) => {
  if (checkAuth(req)) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};


// Deep merge helper for recursive settings merging
const deepMerge = (target, source) => {
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object') {
      if (Array.isArray(source[key])) {
        if (!target[key]) target[key] = [];
        for (let i = 0; i < source[key].length; i++) {
          if (source[key][i] !== undefined) {
            if (typeof source[key][i] === 'object' && source[key][i] !== null) {
              target[key][i] = target[key][i] || (Array.isArray(source[key][i]) ? [] : {});
              deepMerge(target[key][i], source[key][i]);
            } else {
              target[key][i] = source[key][i];
            }
          }
        }
      } else {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      }
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

// Get settings utility
const getSettings = () => {
  const filePath = path.join(__dirname, 'data', 'settings.json');
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading settings.json:', err);
  }
  
  return {
    about: {
      title: "ABOUT SOIL VILLAGE",
      subtitle: "The Wilderness Brand",
      description1: "Soil Village represents the absolute pinnacle of premium outdoor mountain glamping retreats. Secluded within the spectacular pine borders of Solang Valley, Manali, our camp base is an oasis designed to let you escape the chaotic speeds of modern city life.",
      description2: "We combine rugged alpine exploration trails, scenic mountain summits, and winding pristine rivers with cozy campfire logs, warm tea servings, comfortable tents, and starry night sky gazing to carve unforgettable memories.",
      image: "/assets/camp_tent.png.jpeg"
    },
    owner: {
      name: "Renush",
      title: "MEET",
      subtitle: "The Owner",
      designation: "CHIEF EXECUTIVE",
      philosophy: "LUXURY IN SILENCE",
      quote: "A synergy of survival expertise and premium vision. Renush founded this platform to bridge the gap between untamed wilderness and ultra-premium comfort.",
      image: "/assets/reenu.jpeg"
    },
    route: {
      subtitle: "Premium Expedition Route",
      title: "SOLANG VALLEY BASE PATHWAY",
      desc: "Immerse yourself in the breathtaking landscapes of the Himalayas. Our itineraries ensure every moment of your mountain escape is filled with beauty and premium comfort."
    },
    experience: {
      subtitle: "Immersive Retreat",
      title: "CAMPING SOLANG VALLEY",
      quote: "“Leave nothing but footprints, take nothing but memories.”",
      items: [
        { title: "Trekking", desc: "Embark on a magnificent 2-hour guided trek scaling past green forests, alpine brooks, and high elevation mountain flora surrounding the valley camp.", label: "Solang High Peaks" },
        { title: "Nature & Adventure", desc: "Deep dive into pure unadulterated nature. Experience wild hiking ridges, evergreen coniferous woodlands, and local alpine mountain valleys.", label: "Coniferous Ridge" },
        { title: "Campfire", desc: "Gather around a cozy open crackling campfire log fire. Bond, share tales of mountain climbs, and enjoy absolute wilderness relaxation under star skies.", label: "Warm Sunset logs" },
        { title: "Scenic Views", desc: "Open your tent window to awe-inspiring layouts: snow peaks reaching into high blue sky clouds, crystalline pristine rivers, and mountain sunset glows.", label: "Breathtaking Vibe" },
        { title: "Relaxation", desc: "Disconnect from city noise and unwind to the quiet rustling of leaves, bird songs, and running river waters. Restore your mental energy.", label: "Serene Retreat" },
        { title: "Photography", desc: "Capture stunning compositions of alpine peaks, starry night heavens, bright bonfires, dynamic tents, and glowing sunbeams through pine needles.", label: "Alpine Captures" }
      ]
    },
    showcase: {
      subtitle: "Interactive Showcase",
      title: "3D RETREAT GEAR",
      quote: "“Inspect our high-end glamping structures and adventure equipment in 3D WebGL”"
    },
    footer: {
      phone: "+91 96506 40715",
      email: "escape@soilvillage.com",
      location: "Solang Valley, Manali,\nHimachal Pradesh, India",
      location_map_url: "https://maps.google.com/?q=Solang+Valley,+Manali,+Himachal+Pradesh,+India",
      whatsapp: "919650640715",
      social: {
        instagram: "https://instagram.com/soilvillage",
        facebook: "https://facebook.com/soilvillage",
        youtube: "https://youtube.com/@soilvillage"
      }
    },
    itinerary: {
      subtitle: "Chronological Track",
      title: "CAMPING ITINERARY",
      sub_title_2: "SOLANG VALLEY RETREAT",
      days: [
        {
          day: "01",
          title: "DAY 1: BASE CAMP SETTLE",
          items: [
            { num: "01", title: "MEET & GREET", meta: "10:00 AM • El: 2,050m", desc: "Meet and greet at Renush sh Homestay, Soyal. Assembly briefing and guide allocation." },
            { num: "02", title: "2 HOUR ALPINE TREK", meta: "11:30 AM • El: 2,300m", desc: "After that we proceed for a scenic 2 hour trek up the valley ridges passing pristine pine boundaries." },
            { num: "03", title: "REACH CAMP & LUNCH", meta: "01:30 PM • El: 2,480m", desc: "Reach at camp, settle in premium glamping tents, and enjoy a hot wholesome mountain lunch." },
            { num: "04", title: "RELAX & EVENING TEA", meta: "04:30 PM • El: 2,480m", desc: "After lunch, relax in the serene environment. Fresh herbal sunset tea served directly next to the river banks." },
            { num: "05", title: "SNACKS & EXPLORATION", meta: "06:30 PM • El: 2,520m", desc: "Delicious warm starters served. Embark on a brief pine trail walk under rising twilight skies." },
            { num: "06", title: "CAMPFIRE DINNER", meta: "08:30 PM • El: 2,480m", desc: "Warm fireside dinner and comfortable overnight stay at base camp under starlight." }
          ]
        },
        {
          day: "02",
          title: "DAY 2: HIGHLAND HIKING",
          items: [
            { num: "01", title: "EARLY TEA & SNACKS", meta: "06:00 AM • El: 2,480m", desc: "Early morning tea and snacks served at sunrise." },
            { num: "02", title: "1 HOUR SUMMIT HIKING", meta: "07:30 AM • El: 2,710m", desc: "Proceed for a 1 hour morning hiking session and return to base camp." },
            { num: "03", title: "LUNCH AT CAMP", meta: "01:00 PM • El: 2,480m", desc: "Fresh, piping-hot lunch served at camp." },
            { num: "04", title: "RETURN HOMESTAY", meta: "02:30 PM • El: 2,050m", desc: "After lunch, pack up and return safely to Renush sh Homestay with beautiful memories." }
          ]
        }
      ]
    }
  };
};

// Root Route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'SOIL VILLAGE – Solang Valley, Manali',
    settings: getSettings(),
    isAdmin: false
  });
});

// API endpoint for bookings
app.post('/api/book', (req, res) => {
  const { name, phone, email, travelers, date, message, package: selectedPackage } = req.body;

  // Basic validation
  if (!name || !phone || !email || !travelers || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields (Name, Phone, Email, Travelers, Date).'
    });
  }

  // Create booking object
  const booking = {
    id: 'BK-' + Date.now().toString(36).toUpperCase(),
    name,
    phone,
    email,
    travelers: parseInt(travelers),
    date,
    message,
    package: selectedPackage || 'solang',
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  // Save booking details to a JSON file in a data directory inside backend
  const bookingsDir = path.join(__dirname, 'data');
  const filePath = path.join(bookingsDir, 'bookings.json');

  try {
    if (!fs.existsSync(bookingsDir)) {
      fs.mkdirSync(bookingsDir, { recursive: true });
    }

    let bookings = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      bookings = JSON.parse(data || '[]');
    }

    bookings.push(booking);
    fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2), 'utf8');

    return res.status(200).json({
      success: true,
      message: 'Booking request received successfully! Our team will contact you within 24 hours to confirm.',
      bookingId: booking.id
    });
  } catch (error) {
    console.error('Error saving booking:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your booking. Please try again or contact us directly.'
    });
  }
});

// Multer Image Upload Configuration
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- Admin SSR Routes Removed ---

// JSON Login API for Static Frontend
app.post('/admin/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Sign a JWT that expires in 24 hours
    const token = signJWT({
      sub: 'admin',
      iat: Date.now(),
      exp: Date.now() + JWT_EXPIRY_HOURS * 60 * 60 * 1000
    });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// Admin API - Get Dashboard Data
app.get('/admin/api/dashboard-data', apiAuthMiddleware, (req, res) => {
  // Load bookings
  const bookingsFile = path.join(__dirname, 'data', 'bookings.json');
  let bookings = [];
  try {
    if (fs.existsSync(bookingsFile)) {
      bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8') || '[]');
    }
  } catch (err) {
    console.error('Error loading bookings:', err);
  }
  
  // Sort bookings newest first
  bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    success: true,
    bookings,
    settings: getSettings()
  });
});

// --- Admin SSR Form Submission & Dashboard Routes Removed ---

// Admin API - Update Settings
app.post('/admin/api/settings', apiAuthMiddleware, (req, res) => {
  const currentSettings = getSettings();
  const newSettings = req.body;

  // Merge updates recursively
  deepMerge(currentSettings, newSettings);

  const filePath = path.join(__dirname, 'data', 'settings.json');
  try {
    fs.writeFileSync(filePath, JSON.stringify(currentSettings, null, 2), 'utf8');
    return res.json({ success: true, settings: currentSettings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to save settings to server.' });
  }
});

// Admin API - Handle Image Upload
app.post('/admin/api/upload', apiAuthMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const filePath = `/uploads/${req.file.filename}`;
  return res.json({ success: true, filePath });
});

// Admin API - Update Booking Status
app.post('/admin/api/bookings/:id/status', apiAuthMiddleware, (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status.' });
  }

  const bookingsFile = path.join(__dirname, 'data', 'bookings.json');
  try {
    let bookings = [];
    if (fs.existsSync(bookingsFile)) {
      bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8') || '[]');
    }

    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    bookings[bookingIndex].status = status;
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2), 'utf8');
    return res.json({ success: true, booking: bookings[bookingIndex] });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update booking status on server.' });
  }
});

// Admin API - Delete Booking
app.delete('/admin/api/bookings/:id', apiAuthMiddleware, (req, res) => {
  const bookingId = req.params.id;
  const bookingsFile = path.join(__dirname, 'data', 'bookings.json');
  try {
    let bookings = [];
    if (fs.existsSync(bookingsFile)) {
      bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8') || '[]');
    }

    const initialLength = bookings.length;
    bookings = bookings.filter(b => b.id !== bookingId);

    if (bookings.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2), 'utf8');
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete booking on server.' });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found | Soil Village'
  });
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`==================================================`);
    console.log(`🏕️  Soil Village Web App is Running!`);
    console.log(`🔗  Local Link: http://localhost:${port}`);
    console.log(`🚀  Port: ${port}`);
    console.log(`==================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is occupied. Trying next port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);
