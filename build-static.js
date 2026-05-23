const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// Define paths
const viewsDir = path.join(__dirname, 'views');
const distDir = path.join(__dirname, 'dist');
const settingsPath = path.join(__dirname, 'backend', 'data', 'settings.json');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Helper to get settings
const getSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading settings.json:', err);
  }
  // Fallback default settings
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
            { num: "03", title: "REACH BASE CAMP & LUNCH", meta: "01:30 PM • El: 2,480m", desc: "Reach at camp, settle in premium glamping tents, and enjoy a hot wholesome mountain lunch." },
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

// ─── Path fixer: converts absolute /foo paths to relative ./foo ─────────────
function fixAbsolutePaths(html) {
  // Fix href="/css/..." and href="/js/..." and href="/assets/..."
  html = html.replace(/href="\/css\//g, 'href="./css/');
  html = html.replace(/href="\/js\//g, 'href="./js/');
  html = html.replace(/href="\/assets\//g, 'href="./assets/');
  html = html.replace(/href="\/uploads\//g, 'href="./uploads/');

  // Fix src="/css/..." src="/js/..." src="/assets/..." src="/uploads/..."
  html = html.replace(/src="\/css\//g, 'src="./css/');
  html = html.replace(/src="\/js\//g, 'src="./js/');
  html = html.replace(/src="\/assets\//g, 'src="./assets/');
  html = html.replace(/src="\/uploads\//g, 'src="./uploads/');

  // Fix url("/assets/...") in inline styles
  html = html.replace(/url\("\/assets\//g, 'url("./assets/');
  html = html.replace(/url\('\/assets\//g, "url('./assets/");

  return html;
}

// ─── Inline the compiled CSS so the file is self-contained ──────────────────
function inlineCSS(html) {
  const cssPath = path.join(__dirname, 'public', 'css', 'output.css');
  if (!fs.existsSync(cssPath)) {
    console.warn('⚠  output.css not found — run "npm run build:css" first');
    return html;
  }
  const css = fs.readFileSync(cssPath, 'utf8');
  // Replace the link tag with an inline style tag
  html = html.replace(
    /<link rel="stylesheet" href="\.?\/css\/output\.css">/,
    `<style>${css}</style>`
  );
  return html;
}

// ─── Also inline style.css if present ───────────────────────────────────────
function inlineStyleCSS(html) {
  const cssPath = path.join(__dirname, 'public', 'css', 'style.css');
  if (!fs.existsSync(cssPath)) return html;
  const css = fs.readFileSync(cssPath, 'utf8');
  html = html.replace(
    /<link rel="stylesheet" href="\.?\/css\/style\.css">/,
    `<style>${css}</style>`
  );
  return html;
}

const settings = getSettings();

// ─── Build index.html ────────────────────────────────────────────────────────
const indexTemplatePath = path.join(viewsDir, 'index.ejs');
ejs.renderFile(indexTemplatePath, {
  title: 'SOIL VILLAGE – Solang Valley, Manali | Premium Camping & Adventure Retreat',
  settings: settings,
  isAdmin: false
}, {}, (err, str) => {
  if (err) {
    console.error('Error rendering index.ejs:', err);
    process.exit(1);
  }
  str = fixAbsolutePaths(str);
  str = inlineCSS(str);
  str = inlineStyleCSS(str);
  fs.writeFileSync(path.join(distDir, 'index.html'), str, 'utf8');
  console.log('✓ Built dist/index.html (CSS inlined, paths fixed)');
});

// ─── Build terms.html ────────────────────────────────────────────────────────
const termsTemplatePath = path.join(viewsDir, 'terms.ejs');
ejs.renderFile(termsTemplatePath, {
  title: `Terms & Conditions | ${settings.global && settings.global.siteName ? settings.global.siteName : 'Soil Village'}`,
  settings: settings,
  isAdmin: false
}, {}, (err, str) => {
  if (err) {
    console.error('Error rendering terms.ejs:', err);
    process.exit(1);
  }
  str = fixAbsolutePaths(str);
  str = inlineCSS(str);
  str = inlineStyleCSS(str);
  fs.writeFileSync(path.join(distDir, 'terms.html'), str, 'utf8');
  console.log('✓ Built dist/terms.html');
});

// ─── Build 404.html ──────────────────────────────────────────────────────────
const errorTemplatePath = path.join(viewsDir, '404.ejs');
ejs.renderFile(errorTemplatePath, {
  title: 'Page Not Found | Soil Village'
}, {}, (err, str) => {
  if (err) {
    console.error('Error rendering 404.ejs:', err);
    process.exit(1);
  }
  str = fixAbsolutePaths(str);
  str = inlineCSS(str);
  str = inlineStyleCSS(str);
  fs.writeFileSync(path.join(distDir, '404.html'), str, 'utf8');
  console.log('✓ Built dist/404.html');
});

// ─── Recursively copy a directory ────────────────────────────────────────────
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// ─── Copy static assets to dist ──────────────────────────────────────────────
copyDir(path.join(__dirname, 'public', 'assets'),  path.join(distDir, 'assets'));
copyDir(path.join(__dirname, 'public', 'js'),      path.join(distDir, 'js'));
copyDir(path.join(__dirname, 'public', 'css'),     path.join(distDir, 'css'));
copyDir(path.join(__dirname, 'public', 'uploads'), path.join(distDir, 'uploads'));
console.log('✓ Copied static dirs (assets, js, css, uploads) → dist/');
console.log('\n✨ Build complete! Open dist/index.html in any browser.');
