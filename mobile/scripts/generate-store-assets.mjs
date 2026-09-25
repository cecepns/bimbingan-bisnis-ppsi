import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { mkdir, writeFile } from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const frontendAssets = path.join(root, "..", "frontend", "src", "assets");
const logoPath = path.join(frontendAssets, "logo.jpeg");
const outDir = path.join(root, "store-assets");
const iconsDir = path.join(outDir, "icon");
const featureDir = path.join(outDir, "feature-graphic");
const screensDir = path.join(outDir, "screenshots");

await mkdir(iconsDir, { recursive: true });
await mkdir(featureDir, { recursive: true });
await mkdir(screensDir, { recursive: true });

console.log("Preparing high-res logo...");
const rawLogo = await sharp(logoPath).png().toBuffer();

// 1. Generate App Icon (512x512) for Google Play Console
async function generateAppIcon() {
  const size = 512;
  const logoSize = Math.round(size * 0.72);
  const logoBuffer = await sharp(rawLogo)
    .resize(logoSize, logoSize, { fit: "contain" })
    .png()
    .toBuffer();

  const svgBackground = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="110" fill="url(#bgGrad)" />
      <rect width="${size}" height="${size}" rx="110" fill="url(#glow)" />
      <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="108" fill="none" stroke="#6366f1" stroke-width="3" stroke-opacity="0.4" />
      <rect x="70" y="70" width="${size - 140}" height="${size - 140}" rx="48" fill="#ffffff" fill-opacity="0.98" />
    </svg>
  `;

  const bgBuffer = await sharp(Buffer.from(svgBackground)).png().toBuffer();

  const finalIcon = await sharp(bgBuffer)
    .composite([{ input: logoBuffer, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "app-icon-512.png"));

  // Also 1024 version
  await sharp(path.join(iconsDir, "app-icon-512.png"))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(iconsDir, "app-icon-1024.png"));

  console.log("✓ Generated app-icon-512.png & app-icon-1024.png");
}

// 2. Generate Feature Graphic (1024x500) for Google Play Console
async function generateFeatureGraphic() {
  const width = 1024;
  const height = 500;

  const logoSmall = await sharp(rawLogo)
    .resize(140, 140, { fit: "contain" })
    .png()
    .toBuffer();

  const svgBanner = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#030712" />
          <stop offset="45%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e1b4b" />
        </linearGradient>
        <radialGradient id="radial1" cx="20%" cy="20%" r="50%">
          <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="radial2" cx="80%" cy="80%" r="50%">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect width="${width}" height="${height}" fill="url(#radial1)" />
      <rect width="${width}" height="${height}" fill="url(#radial2)" />

      <!-- Subtle Grid -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="0.75" stroke-opacity="0.04"/>
      </pattern>
      <rect width="${width}" height="${height}" fill="url(#grid)" />

      <!-- Left decorative elements & Logo container -->
      <g transform="translate(70, 110)">
        <!-- Outer glow container -->
        <rect x="0" y="0" width="180" height="180" rx="36" fill="#1e293b" fill-opacity="0.8" stroke="#6366f1" stroke-width="2" stroke-opacity="0.6" filter="url(#shadow)" />
        <rect x="15" y="15" width="150" height="150" rx="28" fill="#ffffff" />
      </g>

      <!-- Right/Center Text Content -->
      <g transform="translate(290, 130)">
        <!-- Category Badge -->
        <rect x="0" y="0" width="180" height="34" rx="17" fill="#4f46e5" fill-opacity="0.25" stroke="#6366f1" stroke-width="1.5" stroke-opacity="0.5" />
        <text x="18" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#a5b4fc" letter-spacing="1.5">BIMBINGAN BISNIS</text>

        <!-- Main Heading -->
        <text x="0" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#ffffff" letter-spacing="-0.5">PPSI Official App</text>

        <!-- Subtitle -->
        <text x="0" y="125" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#94a3b8">Platform Belajar &amp; Mentoring Bisnis Digital</text>
        <text x="0" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#64748b">Akses modul kurikulum, video materi praktis, dan evaluasi capaian belajar</text>

        <!-- Feature Pills -->
        <g transform="translate(0, 195)">
          <!-- Pill 1 -->
          <rect x="0" y="0" width="190" height="42" rx="21" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
          <circle cx="22" cy="21" r="7" fill="#10b981" />
          <text x="38" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="600" fill="#f8fafc">Modul Terstruktur</text>

          <!-- Pill 2 -->
          <rect x="205" y="0" width="190" height="42" rx="21" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
          <circle cx="227" cy="21" r="7" fill="#6366f1" />
          <text x="243" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="600" fill="#f8fafc">Video Pembelajaran</text>

          <!-- Pill 3 -->
          <rect x="410" y="0" width="200" height="42" rx="21" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
          <circle cx="432" cy="21" r="7" fill="#f59e0b" />
          <text x="448" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="600" fill="#f8fafc">Tracking Kemajuan</text>
        </g>
      </g>
    </svg>
  `;

  const bgBuffer = await sharp(Buffer.from(svgBanner)).png().toBuffer();

  await sharp(bgBuffer)
    .composite([{ input: logoSmall, top: 130, left: 90 }])
    .png()
    .toFile(path.join(featureDir, "feature-graphic.png"));

  console.log("✓ Generated feature-graphic.png");
}

// 3. Helper to create a Realistic Phone Mockup Screenshot
async function createScreenshot({
  filename,
  badgeText,
  titleText,
  subText,
  accentColor = "#6366f1",
  renderScreenSvg,
  compositeLogo = false,
}) {
  const width = 1080;
  const height = 1920;

  // Phone frame dimensions
  const phoneW = 760;
  const phoneH = 1420;
  const phoneX = Math.round((width - phoneW) / 2);
  const phoneY = 430;
  const screenInnerW = phoneW - 32;
  const screenInnerH = phoneH - 32;

  const svgCanvas = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mainBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="35%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <radialGradient id="topGlow" cx="50%" cy="15%" r="60%">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.30" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <filter id="phoneShadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="30" stdDeviation="35" flood-color="#000000" flood-opacity="0.75" />
          <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="${accentColor}" flood-opacity="0.25" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#mainBg)" />
      <rect width="${width}" height="${height}" fill="url(#topGlow)" />

      <!-- Top Text Banner -->
      <g transform="translate(0, 110)">
        <!-- Pill Badge -->
        <g transform="translate(${width / 2}, 0)">
          <rect x="-110" y="0" width="220" height="40" rx="20" fill="${accentColor}" fill-opacity="0.18" stroke="${accentColor}" stroke-width="1.8" />
          <text x="0" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#cbd5e1" letter-spacing="2">${badgeText}</text>
        </g>

        <!-- Main Title -->
        <text x="${width / 2}" y="105" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="800" fill="#ffffff" letter-spacing="-0.5">${titleText}</text>

        <!-- Subtitle -->
        <text x="${width / 2}" y="152" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#94a3b8">${subText}</text>
      </g>

      <!-- Phone Outer Bezel -->
      <g filter="url(#phoneShadow)">
        <rect x="${phoneX}" y="${phoneY}" width="${phoneW}" height="${phoneH}" rx="64" fill="#090d16" stroke="#334155" stroke-width="4" />
        <rect x="${phoneX + 2}" y="${phoneY + 2}" width="${phoneW - 4}" height="${phoneH - 4}" rx="62" fill="none" stroke="#64748b" stroke-width="1.5" stroke-opacity="0.5" />
      </g>

      <!-- Phone Screen Viewport Clip -->
      <defs>
        <clipPath id="screenClip">
          <rect x="${phoneX + 16}" y="${phoneY + 16}" width="${screenInnerW}" height="${screenInnerH}" rx="50" />
        </clipPath>
      </defs>

      <!-- Screen Container -->
      <g clip-path="url(#screenClip)">
        <!-- Screen Background -->
        <rect x="${phoneX + 16}" y="${phoneY + 16}" width="${screenInnerW}" height="${screenInnerH}" fill="#030712" />

        <!-- Status Bar -->
        <g transform="translate(${phoneX + 16}, ${phoneY + 16})">
          <text x="44" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#ffffff">09:41</text>
          <!-- Dynamic Island Notch -->
          <rect x="${(screenInnerW - 130) / 2}" y="14" width="130" height="28" rx="14" fill="#000000" />
          <circle cx="${(screenInnerW - 130) / 2 + 105}" cy="28" r="5" fill="#1e293b" />
          <!-- Icons (Signal, Wifi, Battery) -->
          <g transform="translate(${screenInnerW - 95}, 24)" fill="#ffffff">
            <rect x="0" y="8" width="3" height="6" rx="0.5" />
            <rect x="5" y="6" width="3" height="8" rx="0.5" />
            <rect x="10" y="3" width="3" height="11" rx="0.5" />
            <rect x="15" y="0" width="3" height="14" rx="0.5" />
            <rect x="35" y="2" width="22" height="11" rx="3" fill="none" stroke="#ffffff" stroke-width="1.5" />
            <rect x="37" y="4" width="15" height="7" rx="1.5" fill="#ffffff" />
            <rect x="58" y="5" width="2" height="5" rx="0.8" fill="#ffffff" />
          </g>
        </g>

        <!-- Inner Application Content -->
        <g transform="translate(${phoneX + 16}, ${phoneY + 70})">
          ${renderScreenSvg(screenInnerW, screenInnerH - 70)}
        </g>

        <!-- Home Indicator Bar -->
        <rect x="${phoneX + 16 + (screenInnerW - 140) / 2}" y="${phoneY + phoneH - 30}" width="140" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.4" />
      </g>
    </svg>
  `;

  const baseBuffer = await sharp(Buffer.from(svgCanvas)).png().toBuffer();

  let finalBuffer = baseBuffer;
  if (compositeLogo) {
    const logoIcon = await sharp(rawLogo)
      .resize(92, 92, { fit: "contain" })
      .png()
      .toBuffer();
    finalBuffer = await sharp(baseBuffer)
      .composite([{ input: logoIcon, top: phoneY + 165, left: phoneX + 16 + Math.round((screenInnerW - 92) / 2) }])
      .png()
      .toBuffer();
  }

  const outPath = path.join(screensDir, filename);
  await writeFile(outPath, finalBuffer);
  console.log(`✓ Generated ${filename}`);
}

// Screenshot 1: Halaman Login & Akses Member
async function generateScreenshot1() {
  await createScreenshot({
    filename: "screenshot-1-login.png",
    badgeText: "AKSES MUDAH",
    titleText: "Akses Akun Terintegrasi",
    subText: "Masuk cepat menggunakan Email atau nomor WhatsApp",
    accentColor: "#6366f1",
    compositeLogo: true,
    renderScreenSvg: (w, h) => `
      <!-- App Header inside Login -->
      <g transform="translate(0, 20)">
        <!-- Logo Box Placeholder -->
        <rect x="${(w - 110) / 2}" y="65" width="110" height="110" rx="24" fill="#ffffff" stroke="#334155" stroke-width="2" />

        <text x="${w / 2}" y="225" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="27" font-weight="800" fill="#ffffff">Bimbingan Bisnis PPSI</text>
        <text x="${w / 2}" y="255" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500" fill="#818cf8">Platform Pembelajaran Digital</text>
      </g>

      <!-- Login Form Card -->
      <g transform="translate(36, 310)">
        <rect x="0" y="0" width="${w - 72}" height="540" rx="28" fill="#0f172a" fill-opacity="0.9" stroke="#1e293b" stroke-width="2" />

        <text x="32" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#ffffff">Masuk ke akun Anda</text>

        <!-- Email Field -->
        <text x="32" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="500" fill="#94a3b8">Email / No. WhatsApp</text>
        <rect x="32" y="120" width="${w - 136}" height="58" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
        <circle cx="58" cy="149" r="8" fill="#64748b" />
        <text x="80" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" fill="#ffffff">member@bisnis-ppsi.com</text>

        <!-- Password Field -->
        <g transform="translate(0, 100)">
          <text x="32" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="500" fill="#94a3b8">Password</text>
          <text x="${w - 140}" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="600" fill="#818cf8">Lupa password?</text>
          <rect x="32" y="120" width="${w - 136}" height="58" rx="14" fill="#1e293b" stroke="#4f46e5" stroke-width="2" />
          <circle cx="58" cy="149" r="8" fill="#818cf8" />
          <text x="80" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" fill="#ffffff">••••••••••••</text>
          <!-- Eye icon -->
          <circle cx="${w - 165}" cy="149" r="6" fill="#64748b" />
        </g>

        <!-- Submit Button -->
        <g transform="translate(32, 340)">
          <rect x="0" y="0" width="${w - 136}" height="58" rx="16" fill="#4f46e5" />
          <text x="${(w - 136) / 2}" y="36" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16.5" font-weight="700" fill="#ffffff">Masuk Sekarang</text>
        </g>

        <!-- Register Link -->
        <text x="${(w - 72) / 2}" y="455" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#64748b">
          Belum punya akun? <tspan fill="#818cf8" font-weight="600">Daftar sekarang</tspan>
        </text>

        <!-- Security Note -->
        <rect x="32" y="485" width="${w - 136}" height="34" rx="8" fill="#1e1b4b" fill-opacity="0.6" />
        <text x="${(w - 72) / 2}" y="507" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#a5b4fc">🔒 Sistem Terenkripsi &amp; Terlindungi</text>
      </g>
    `,
  });
}

// Screenshot 2: Member Dashboard & Progress
async function generateScreenshot2() {
  await createScreenshot({
    filename: "screenshot-2-dashboard.png",
    badgeText: "DASHBOARD",
    titleText: "Pantau Kemajuan Belajar",
    subText: "Ringkasan kurikulum, statistik materi, dan evaluasi capaian",
    accentColor: "#10b981",
    renderScreenSvg: (w, h) => `
      <!-- Member Navigation / Top Bar -->
      <g transform="translate(32, 10)">
        <circle cx="24" cy="24" r="22" fill="#312e81" />
        <text x="24" y="30" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#a5b4fc">CS</text>
        <text x="60" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Selamat Datang</text>
        <text x="60" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="700" fill="#ffffff">Cecep Supriatna</text>

        <!-- Notification Bell -->
        <circle cx="${w - 95}" cy="24" r="20" fill="#1e293b" />
        <circle cx="${w - 95}" cy="24" r="7" fill="#818cf8" />
      </g>

      <!-- Welcome Hero Banner -->
      <g transform="translate(32, 85)">
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#312e81" />
            <stop offset="100%" stop-color="#4f46e5" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${w - 64}" height="190" rx="24" fill="url(#heroGrad)" stroke="#6366f1" stroke-width="1.5" />
        <text x="28" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="600" fill="#c7d2fe">PROGRES BELAJAR AKTIF</text>
        <text x="28" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#ffffff">Lanjutkan Belajar Bisnis</text>
        <text x="28" y="108" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#e0e7ff">Modul 4: Riset Pasar &amp; Validasi Ide Produk</text>

        <!-- Action Button -->
        <g transform="translate(28, 126)">
          <rect x="0" y="0" width="180" height="42" rx="12" fill="#ffffff" />
          <polygon points="24,14 24,28 36,21" fill="#4f46e5" />
          <text x="46" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#4f46e5">Lanjut Materi</text>
        </g>
      </g>

      <!-- 4 Stats Cards Grid -->
      <g transform="translate(32, 300)">
        <!-- Stat 1 -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="${(w - 84) / 2}" height="105" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="34" cy="34" r="16" fill="#4f46e5" fill-opacity="0.2" />
          <text x="34" y="39" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#818cf8">📚</text>
          <text x="24" y="72" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">24</text>
          <text x="24" y="92" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">Total Materi</text>
        </g>

        <!-- Stat 2 -->
        <g transform="translate(${(w - 84) / 2 + 20}, 0)">
          <rect x="0" y="0" width="${(w - 84) / 2}" height="105" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="34" cy="34" r="16" fill="#10b981" fill-opacity="0.2" />
          <text x="34" y="39" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#34d399">✓</text>
          <text x="24" y="72" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">18</text>
          <text x="24" y="92" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">Materi Selesai</text>
        </g>

        <!-- Stat 3 -->
        <g transform="translate(0, 125)">
          <rect x="0" y="0" width="${(w - 84) / 2}" height="105" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="34" cy="34" r="16" fill="#f59e0b" fill-opacity="0.2" />
          <text x="34" y="39" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#fbbf24">⏳</text>
          <text x="24" y="72" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">2</text>
          <text x="24" y="92" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">Sedang Belajar</text>
        </g>

        <!-- Stat 4 -->
        <g transform="translate(${(w - 84) / 2 + 20}, 125)">
          <rect x="0" y="0" width="${(w - 84) / 2}" height="105" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="34" cy="34" r="16" fill="#64748b" fill-opacity="0.2" />
          <text x="34" y="39" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#94a3b8">🔒</text>
          <text x="24" y="72" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">4</text>
          <text x="24" y="92" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">Materi Terkunci</text>
        </g>
      </g>

      <!-- Overall Progress Card -->
      <g transform="translate(32, 555)">
        <rect x="0" y="0" width="${w - 64}" height="135" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff">Tingkat Penyelesaian Kurikulum</text>
        <text x="${w - 110}" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#10b981">75%</text>

        <!-- Progress Bar Track -->
        <rect x="24" y="56" width="${w - 112}" height="14" rx="7" fill="#1e293b" />
        <rect x="24" y="56" width="${(w - 112) * 0.75}" height="14" rx="7" fill="#10b981" />

        <text x="24" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">18 dari 24 materi berhasil Anda selesaikan dengan baik.</text>
      </g>

      <!-- Bottom Tab Bar Mockup -->
      <g transform="translate(0, ${h - 80})">
        <rect x="0" y="0" width="${w}" height="80" fill="#0b0f19" stroke="#1e293b" stroke-width="1" />
        <!-- Tab 1: Dashboard (Active) -->
        <g transform="translate(${w * 0.15}, 20)">
          <circle cx="16" cy="12" r="10" fill="#4f46e5" fill-opacity="0.3" />
          <text x="16" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#818cf8">Beranda</text>
        </g>
        <!-- Tab 2: Materials -->
        <g transform="translate(${w * 0.40}, 20)">
          <circle cx="16" cy="12" r="8" fill="#334155" />
          <text x="16" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Materi</text>
        </g>
        <!-- Tab 3: Progress -->
        <g transform="translate(${w * 0.65}, 20)">
          <circle cx="16" cy="12" r="8" fill="#334155" />
          <text x="16" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Progres</text>
        </g>
        <!-- Tab 4: Profile -->
        <g transform="translate(${w * 0.85}, 20)">
          <circle cx="16" cy="12" r="8" fill="#334155" />
          <text x="16" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Akun</text>
        </g>
      </g>
    `,
  });
}

// Screenshot 3: Katalog Materi & Kurikulum Bisnis
async function generateScreenshot3() {
  await createScreenshot({
    filename: "screenshot-3-materials.png",
    badgeText: "KURIKULUM",
    titleText: "Modul Bisnis Terstruktur",
    subText: "Materi aplikatif disusun bertahap dari fundamental hingga eksekusi",
    accentColor: "#3b82f6",
    renderScreenSvg: (w, h) => `
      <!-- Header -->
      <g transform="translate(32, 15)">
        <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">Daftar Modul Belajar</text>
        <text x="0" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#94a3b8">Akses seluruh seri pelatihan bimbingan bisnis PPSI</text>

        <!-- Search Bar -->
        <rect x="0" y="75" width="${w - 64}" height="52" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <circle cx="28" cy="101" r="8" fill="none" stroke="#64748b" stroke-width="2" />
        <line x1="34" y1="107" x2="42" y2="115" stroke="#64748b" stroke-width="2" />
        <text x="56" y="107" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14.5" fill="#64748b">Cari judul materi bisnis...</text>
      </g>

      <!-- Filter Chips -->
      <g transform="translate(32, 160)">
        <rect x="0" y="0" width="85" height="34" rx="17" fill="#4f46e5" />
        <text x="42" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="700" fill="#ffffff">Semua</text>

        <rect x="95" y="0" width="115" height="34" rx="17" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="152" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" fill="#94a3b8">Fundamental</text>

        <rect x="220" y="0" width="105" height="34" rx="17" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="272" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" fill="#94a3b8">Pemasaran</text>

        <rect x="335" y="0" width="105" height="34" rx="17" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="387" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" fill="#94a3b8">Keuangan</text>
      </g>

      <!-- Materials List -->
      <g transform="translate(32, 215)">
        <!-- Material 1 (Completed) -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="${w - 64}" height="120" rx="18" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
          <circle cx="40" cy="40" r="20" fill="#10b981" fill-opacity="0.15" />
          <text x="40" y="46" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#10b981">✓</text>
          <text x="75" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff">01. Pondasi Pola Pikir &amp; Visi Bisnis</text>
          <text x="75" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">Pengenalan ekosistem bisnis PPSI &amp; mindset wirausaha</text>
          <rect x="75" y="75" width="80" height="24" rx="6" fill="#10b981" fill-opacity="0.15" />
          <text x="115" y="91" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#34d399">Selesai</text>
          <text x="175" y="91" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b">⏱ 25 Menit Video</text>
        </g>

        <!-- Material 2 (In Progress / Active) -->
        <g transform="translate(0, 138)">
          <rect x="0" y="0" width="${w - 64}" height="120" rx="18" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
          <circle cx="40" cy="40" r="20" fill="#6366f1" fill-opacity="0.25" />
          <polygon points="36,32 36,48 48,40" fill="#818cf8" />
          <text x="75" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff">02. Riset Pasar &amp; Segmentasi Konsumen</text>
          <text x="75" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#c7d2fe">Teknik validasi ide produk dan target audiens potensial</text>
          <rect x="75" y="75" width="110" height="24" rx="6" fill="#4f46e5" fill-opacity="0.4" />
          <text x="130" y="91" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#a5b4fc">Sedang Dipelajari</text>
          <text x="205" y="91" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94a3b8">⏱ 35 Menit Video</text>
        </g>

        <!-- Material 3 (Available Next) -->
        <g transform="translate(0, 276)">
          <rect x="0" y="0" width="${w - 64}" height="120" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <circle cx="40" cy="40" r="20" fill="#334155" />
          <text x="40" y="46" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#94a3b8">03</text>
          <text x="75" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff">03. Strategi Marketing Funnel &amp; Closing</text>
          <text x="75" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">Optimalisasi konversi prospek menjadi pembeli setia</text>
          <rect x="75" y="75" width="85" height="24" rx="6" fill="#1e293b" />
          <text x="117" y="91" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#94a3b8">Tersedia</text>
          <text x="180" y="91" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b">⏱ 40 Menit Video</text>
        </g>

        <!-- Material 4 (Locked) -->
        <g transform="translate(0, 414)">
          <rect x="0" y="0" width="${w - 64}" height="120" rx="18" fill="#0a0e1a" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4" />
          <circle cx="40" cy="40" r="20" fill="#1e293b" />
          <text x="40" y="46" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#64748b">🔒</text>
          <text x="75" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748b">04. Manajemen Arus Kas &amp; Finansial Bisnis</text>
          <text x="75" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#475569">Selesaikan materi sebelumnya untuk membuka modul ini</text>
          <rect x="75" y="75" width="75" height="24" rx="6" fill="#1e293b" />
          <text x="112" y="91" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Terkunci</text>
        </g>
      </g>
    `,
  });
}

// Screenshot 4: Detail Pembelajaran & Video Panduan
async function generateScreenshot4() {
  await createScreenshot({
    filename: "screenshot-4-video-detail.png",
    badgeText: "STUDI KASUS",
    titleText: "Video Materi Interaktif",
    subText: "Panduan audio visual langsung disertai ringkasan materi",
    accentColor: "#8b5cf6",
    renderScreenSvg: (w, h) => `
      <!-- Video Player Viewport -->
      <g transform="translate(24, 15)">
        <rect x="0" y="0" width="${w - 48}" height="280" rx="20" fill="#090d16" stroke="#334155" stroke-width="1.5" />
        <!-- Mock Video Background Pattern -->
        <rect x="2" y="2" width="${w - 52}" height="276" rx="18" fill="#1e1b4b" fill-opacity="0.7" />

        <!-- Big Play Button Center -->
        <circle cx="${(w - 48) / 2}" cy="130" r="38" fill="#4f46e5" fill-opacity="0.9" stroke="#ffffff" stroke-width="2" />
        <polygon points="${(w - 48) / 2 - 8},116 ${(w - 48) / 2 - 8},144 ${(w - 48) / 2 + 14},130" fill="#ffffff" />

        <!-- Video Badge overlay -->
        <rect x="20" y="20" width="110" height="28" rx="6" fill="#000000" fill-opacity="0.75" />
        <text x="75" y="39" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#ffffff">MODUL 02</text>

        <!-- Video Progress Bar bottom -->
        <rect x="20" y="250" width="${w - 88}" height="5" rx="2.5" fill="#334155" />
        <rect x="20" y="250" width="${(w - 88) * 0.45}" height="5" rx="2.5" fill="#818cf8" />
        <circle cx="${20 + (w - 88) * 0.45}" cy="252.5" r="5" fill="#ffffff" />
        <text x="${w - 68}" y="242" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#94a3b8">12:35 / 28:00</text>
      </g>

      <!-- Video Meta & Title -->
      <g transform="translate(32, 320)">
        <text x="0" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Riset Pasar &amp; Segmentasi Konsumen</text>
        <text x="0" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#818cf8">Modul Pembelajaran Bisnis PPSI • Level Menengah</text>

        <!-- Key Points / Summary Box -->
        <rect x="0" y="75" width="${w - 64}" height="220" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#ffffff" transform="translate(0, 75)">Poin Pembelajaran Modul:</text>

        <g transform="translate(24, 125)">
          <!-- Bullet 1 -->
          <circle cx="6" cy="6" r="4" fill="#10b981" />
          <text x="22" y="10" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#cbd5e1">Mengidentifikasi masalah utama calon pelanggan potensial</text>

          <!-- Bullet 2 -->
          <circle cx="6" cy="38" r="4" fill="#10b981" />
          <text x="22" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#cbd5e1">Strategi penentuan Unique Selling Proposition (USP)</text>

          <!-- Bullet 3 -->
          <circle cx="6" cy="70" r="4" fill="#10b981" />
          <text x="22" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#cbd5e1">Pemetaan peta persaingan pasar dan diferensiasi produk</text>

          <!-- Bullet 4 -->
          <circle cx="6" cy="102" r="4" fill="#10b981" />
          <text x="22" y="106" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#cbd5e1">Panduan praktis validasi penawaran tanpa modal besar</text>
        </g>

        <!-- Mark As Complete CTA Button -->
        <g transform="translate(0, 315)">
          <rect x="0" y="0" width="${w - 64}" height="56" rx="16" fill="#10b981" />
          <text x="${(w - 64) / 2}" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff">✓ Tandai Selesai &amp; Lanjut</text>
        </g>
      </g>
    `,
  });
}

// Screenshot 5: Tracking Progres & Sertifikasi
async function generateScreenshot5() {
  await createScreenshot({
    filename: "screenshot-5-progress.png",
    badgeText: "EVALUASI",
    titleText: "Tracking Capaian Belajar",
    subText: "Monitor perkembangan modul dan milestone sertifikasi member",
    accentColor: "#ec4899",
    renderScreenSvg: (w, h) => `
      <!-- Profile & Badge Section -->
      <g transform="translate(32, 20)">
        <rect x="0" y="0" width="${w - 64}" height="140" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <circle cx="55" cy="55" r="35" fill="#4f46e5" />
        <text x="55" y="62" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#ffffff">CS</text>

        <text x="110" y="46" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#ffffff">Cecep Supriatna</text>
        <text x="110" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">Member Bisnis Terverifikasi</text>

        <rect x="110" y="85" width="130" height="26" rx="6" fill="#10b981" fill-opacity="0.2" />
        <text x="175" y="102" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="600" fill="#34d399">Akun Aktif PPSI</text>
      </g>

      <!-- Learning Milestone Chart Box -->
      <g transform="translate(32, 180)">
        <rect x="0" y="0" width="${w - 64}" height="240" rx="20" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff">Aktivitas Belajar Mingguan</text>
        <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" fill="#94a3b8">Rata-rata 4.5 jam modul diselesaikan / minggu</text>

        <!-- Simulated Bar Chart -->
        <g transform="translate(24, 90)">
          <!-- Mon -->
          <rect x="15" y="40" width="30" height="70" rx="6" fill="#312e81" />
          <text x="30" y="130" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Sen</text>
          <!-- Tue -->
          <rect x="65" y="20" width="30" height="90" rx="6" fill="#4f46e5" />
          <text x="80" y="130" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Sel</text>
          <!-- Wed -->
          <rect x="115" y="50" width="30" height="60" rx="6" fill="#312e81" />
          <text x="130" y="130" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Rab</text>
          <!-- Thu -->
          <rect x="165" y="10" width="30" height="100" rx="6" fill="#6366f1" />
          <text x="180" y="130" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Kam</text>
          <!-- Fri -->
          <rect x="215" y="25" width="30" height="85" rx="6" fill="#4f46e5" />
          <text x="230" y="130" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Jum</text>
          <!-- Sat -->
          <rect x="265" y="5" width="30" height="105" rx="6" fill="#10b981" />
          <text x="280" y="130" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#10b981" font-weight="700">Sab</text>
          <!-- Sun -->
          <rect x="315" y="35" width="30" height="75" rx="6" fill="#312e81" />
          <text x="330" y="130" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Min</text>
        </g>
      </g>

      <!-- Completed Modules List -->
      <g transform="translate(32, 440)">
        <text x="0" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#ffffff">Pencapaian Terkini</text>

        <!-- Badge 1 -->
        <g transform="translate(0, 40)">
          <rect x="0" y="0" width="${w - 64}" height="76" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
          <circle cx="36" cy="38" r="18" fill="#10b981" fill-opacity="0.2" />
          <text x="36" y="44" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#10b981">🏆</text>
          <text x="68" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#ffffff">Lulus Modul Fundamental Bisnis</text>
          <text x="68" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94a3b8">Nilai kuis pemahaman: 96/100</text>
        </g>

        <!-- Badge 2 -->
        <g transform="translate(0, 126)">
          <rect x="0" y="0" width="${w - 64}" height="76" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1.2" />
          <circle cx="36" cy="38" r="18" fill="#6366f1" fill-opacity="0.2" />
          <text x="36" y="44" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#818cf8">🎖</text>
          <text x="68" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14.5" font-weight="700" fill="#ffffff">Studi Kasus Riset Pasar Terverifikasi</text>
          <text x="68" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94a3b8">Disetujui oleh Mentor Pendamping PPSI</text>
        </g>
      </g>
    `,
  });
}

async function run() {
  console.log("Generating Store Assets for Google Play Console...");
  await generateAppIcon();
  await generateFeatureGraphic();
  await generateScreenshot1();
  await generateScreenshot2();
  await generateScreenshot3();
  await generateScreenshot4();
  await generateScreenshot5();
  console.log("All store assets successfully created in /mobile/store-assets!");
}

run().catch((err) => {
  console.error("Error generating store assets:", err);
  process.exit(1);
});
