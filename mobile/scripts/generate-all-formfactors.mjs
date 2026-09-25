import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { mkdir, writeFile } from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outScreensDir = path.join(root, "store-assets", "screenshots");

const tablet7Dir = path.join(outScreensDir, "tablet-7inch");
const tablet10Dir = path.join(outScreensDir, "tablet-10inch");
const desktopDir = path.join(outScreensDir, "desktop");
const xrDir = path.join(outScreensDir, "android-xr");

await mkdir(tablet7Dir, { recursive: true });
await mkdir(tablet10Dir, { recursive: true });
await mkdir(desktopDir, { recursive: true });
await mkdir(xrDir, { recursive: true });

function escapeXml(unsafe) {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// -------------------------------------------------------------
// 1. TABLET SCREENSHOT CREATOR (7" & 10")
// -------------------------------------------------------------
async function createTabletScreenshot({
  outPath,
  width,
  height,
  badgeText,
  titleText,
  subText,
  accentColor = "#6366f1",
  renderContentSvg,
}) {
  const padX = Math.round(width * 0.05);
  const topHeaderH = Math.round(height * 0.16);
  const frameW = width - padX * 2;
  const frameH = height - topHeaderH - Math.round(height * 0.04);
  const frameX = padX;
  const frameY = topHeaderH;
  const innerMargin = 16;
  const innerW = frameW - innerMargin * 2;
  const innerH = frameH - innerMargin * 2;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tabBg_${width}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="40%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <radialGradient id="topGlow_${width}" cx="50%" cy="10%" r="50%">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.32" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <filter id="tabShadow_${width}" x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.8"/>
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${accentColor}" flood-opacity="0.25"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#tabBg_${width})" />
      <rect width="${width}" height="${height}" fill="url(#topGlow_${width})" />

      <!-- Top Text Banner -->
      <g transform="translate(${width / 2}, ${Math.round(height * 0.038)})">
        <!-- Pill Badge -->
        <rect x="-120" y="0" width="240" height="34" rx="17" fill="${accentColor}" fill-opacity="0.20" stroke="${accentColor}" stroke-width="1.8" />
        <text x="0" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#cbd5e1" letter-spacing="2">${escapeXml(badgeText)}</text>

        <!-- Title -->
        <text x="0" y="68" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="-0.5">${escapeXml(titleText)}</text>

        <!-- Subtitle -->
        <text x="0" y="100" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94a3b8">${escapeXml(subText)}</text>
      </g>

      <!-- Tablet Outer Bezel -->
      <g filter="url(#tabShadow_${width})">
        <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="36" fill="#090d16" stroke="#334155" stroke-width="3" />
        <!-- Front Camera Dot on top bezel -->
        <circle cx="${frameX + frameW / 2}" cy="${frameY + innerMargin / 2}" r="4" fill="#1e293b" stroke="#334155" stroke-width="1" />
      </g>

      <!-- Screen Viewport Clip -->
      <defs>
        <clipPath id="tabClip_${width}">
          <rect x="${frameX + innerMargin}" y="${frameY + innerMargin}" width="${innerW}" height="${innerH}" rx="22" />
        </clipPath>
      </defs>

      <!-- Tablet Screen Content -->
      <g clip-path="url(#tabClip_${width})">
        <rect x="${frameX + innerMargin}" y="${frameY + innerMargin}" width="${innerW}" height="${innerH}" fill="#030712" />

        <!-- Status Bar -->
        <g transform="translate(${frameX + innerMargin}, ${frameY + innerMargin})">
          <rect width="${innerW}" height="30" fill="#090d16" />
          <text x="24" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#ffffff">09:41</text>
          <g transform="translate(${innerW - 90}, 10)" fill="#ffffff">
            <rect x="0" y="5" width="2.5" height="5" rx="0.5" />
            <rect x="4" y="3" width="2.5" height="7" rx="0.5" />
            <rect x="8" y="1" width="2.5" height="9" rx="0.5" />
            <rect x="12" y="0" width="2.5" height="10" rx="0.5" />
            <rect x="30" y="2" width="18" height="9" rx="2.5" fill="none" stroke="#ffffff" stroke-width="1.2" />
            <rect x="32" y="3.5" width="12" height="6" rx="1" fill="#ffffff" />
          </g>
        </g>

        <!-- Inner Rendered SVG Content -->
        <g transform="translate(${frameX + innerMargin}, ${frameY + innerMargin + 30})">
          ${renderContentSvg(innerW, innerH - 30)}
        </g>
      </g>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(outPath, buffer);
  console.log(`✓ Created: ${path.basename(outPath)}`);
}

// -------------------------------------------------------------
// 2. DESKTOP / CHROMEBOOK SCREENSHOT CREATOR (1920x1080)
// -------------------------------------------------------------
async function createDesktopScreenshot({
  outPath,
  badgeText,
  titleText,
  subText,
  accentColor = "#6366f1",
  renderContentSvg,
}) {
  const width = 1920;
  const height = 1080;
  const winW = 1680;
  const winH = 820;
  const winX = Math.round((width - winW) / 2);
  const winY = 190;
  const titleBarH = 46;
  const innerW = winW;
  const innerH = winH - titleBarH;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="deskBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="45%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <radialGradient id="deskGlow" cx="50%" cy="15%" r="55%">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.32" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <filter id="deskShadow" x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.85"/>
          <feDropShadow dx="0" dy="6" stdDeviation="15" flood-color="${accentColor}" flood-opacity="0.25"/>
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="url(#deskBg)" />
      <rect width="${width}" height="${height}" fill="url(#deskGlow)" />

      <!-- Top Banner -->
      <g transform="translate(${width / 2}, 38)">
        <rect x="-125" y="0" width="250" height="34" rx="17" fill="${accentColor}" fill-opacity="0.20" stroke="${accentColor}" stroke-width="1.8" />
        <text x="0" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#cbd5e1" letter-spacing="2">${escapeXml(badgeText)}</text>

        <text x="0" y="72" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="-0.5">${escapeXml(titleText)}</text>

        <text x="0" y="105" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94a3b8">${escapeXml(subText)}</text>
      </g>

      <!-- Browser Frame -->
      <g filter="url(#deskShadow)">
        <rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" rx="18" fill="#090d16" stroke="#334155" stroke-width="2" />
      </g>

      <!-- Title Bar -->
      <g transform="translate(${winX}, ${winY})">
        <rect width="${winW}" height="${titleBarH}" rx="18" fill="#0f172a" />
        <rect y="${titleBarH - 10}" width="${winW}" height="10" fill="#0f172a" />
        <line x1="0" y1="${titleBarH}" x2="${winW}" y2="${titleBarH}" stroke="#1e293b" stroke-width="1.5" />

        <circle cx="28" cy="${titleBarH / 2}" r="6.5" fill="#ef4444" />
        <circle cx="48" cy="${titleBarH / 2}" r="6.5" fill="#f59e0b" />
        <circle cx="68" cy="${titleBarH / 2}" r="6.5" fill="#10b981" />

        <rect x="180" y="9" width="${winW - 360}" height="28" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <text x="${winW / 2}" y="28" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#94a3b8">🔒 https://bimbingan-bisnis-ppsi.vercel.app/member</text>
      </g>

      <defs>
        <clipPath id="deskClip">
          <rect x="${winX}" y="${winY + titleBarH}" width="${innerW}" height="${innerH}" rx="12" />
        </clipPath>
      </defs>

      <g clip-path="url(#deskClip)">
        <rect x="${winX}" y="${winY + titleBarH}" width="${innerW}" height="${innerH}" fill="#030712" />
        <g transform="translate(${winX}, ${winY + titleBarH})">
          ${renderContentSvg(innerW, innerH)}
        </g>
      </g>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(outPath, buffer);
  console.log(`✓ Created: ${path.basename(outPath)}`);
}

// -------------------------------------------------------------
// 3. ANDROID XR / SPATIAL COMPUTING CREATOR (1920x1080)
// -------------------------------------------------------------
async function createAndroidXrScreenshot({
  outPath,
  badgeText,
  titleText,
  subText,
  accentColor = "#6366f1",
  renderContentSvg,
}) {
  const width = 1920;
  const height = 1080;
  const spatialW = 1580;
  const spatialH = 760;
  const spatialX = Math.round((width - spatialW) / 2);
  const spatialY = 190;
  const headerBarH = 44;
  const innerW = spatialW;
  const innerH = spatialH - headerBarH;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Spatial XR 3D Room Background -->
        <linearGradient id="xrBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#050816" />
          <stop offset="50%" stop-color="#0b0f24" />
          <stop offset="100%" stop-color="#02040a" />
        </linearGradient>
        <radialGradient id="spatialGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.38" />
          <stop offset="60%" stop-color="#4f46e5" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <filter id="spatialGlass" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="30" stdDeviation="35" flood-color="#000000" flood-opacity="0.9"/>
          <feDropShadow dx="0" dy="4" stdDeviation="16" flood-color="${accentColor}" flood-opacity="0.35"/>
        </filter>
        <!-- 3D Spatial Grid Floor -->
        <pattern id="xrGrid" width="60" height="30" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#6366f1" stroke-width="0.75" stroke-opacity="0.08"/>
        </pattern>
      </defs>

      <!-- Spatial Environment -->
      <rect width="${width}" height="${height}" fill="url(#xrBg)" />
      <rect width="${width}" height="${height}" fill="url(#spatialGlow)" />
      <rect y="${height * 0.65}" width="${width}" height="${height * 0.35}" fill="url(#xrGrid)" />

      <!-- Top Banner -->
      <g transform="translate(${width / 2}, 36)">
        <rect x="-130" y="0" width="260" height="34" rx="17" fill="${accentColor}" fill-opacity="0.22" stroke="${accentColor}" stroke-width="1.8" />
        <text x="0" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#cbd5e1" letter-spacing="2">${escapeXml(badgeText)}</text>

        <text x="0" y="70" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="-0.5">${escapeXml(titleText)}</text>

        <text x="0" y="102" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="400" fill="#94a3b8">${escapeXml(subText)}</text>
      </g>

      <!-- Floating Glass Spatial Window -->
      <g filter="url(#spatialGlass)">
        <!-- Outer Glass Border -->
        <rect x="${spatialX}" y="${spatialY}" width="${spatialW}" height="${spatialH}" rx="32" fill="#090d18" fill-opacity="0.92" stroke="#6366f1" stroke-width="2" stroke-opacity="0.5" />
      </g>

      <!-- Spatial Window Title Header -->
      <g transform="translate(${spatialX}, ${spatialY})">
        <!-- Curved top header -->
        <rect width="${spatialW}" height="${headerBarH}" rx="32" fill="#131b2e" fill-opacity="0.95" />
        <rect y="${headerBarH - 12}" width="${spatialW}" height="12" fill="#131b2e" />
        <line x1="0" y1="${headerBarH}" x2="${spatialW}" y2="${headerBarH}" stroke="#334155" stroke-width="1" />

        <!-- Spatial Window Controls -->
        <g transform="translate(24, ${headerBarH / 2})">
          <circle cx="0" cy="0" r="5.5" fill="#ef4444" />
          <circle cx="18" cy="0" r="5.5" fill="#f59e0b" />
          <circle cx="36" cy="0" r="5.5" fill="#10b981" />
        </g>

        <!-- Spatial Window Title -->
        <text x="${spatialW / 2}" y="27" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1">🥽 Android XR Spatial Panel • Bimbingan Bisnis PPSI</text>

        <!-- Pin / Fullscreen XR badge -->
        <rect x="${spatialW - 140}" y="10" width="115" height="24" rx="12" fill="#1e293b" stroke="#475569" stroke-width="1" />
        <text x="${spatialW - 82}" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#a5b4fc">Ruang Virtual</text>
      </g>

      <!-- Clip for inner app content -->
      <defs>
        <clipPath id="xrClip">
          <rect x="${spatialX}" y="${spatialY + headerBarH}" width="${innerW}" height="${innerH}" rx="20" />
        </clipPath>
      </defs>

      <g clip-path="url(#xrClip)">
        <rect x="${spatialX}" y="${spatialY + headerBarH}" width="${innerW}" height="${innerH}" fill="#030712" />
        <g transform="translate(${spatialX}, ${spatialY + headerBarH})">
          ${renderContentSvg(innerW, innerH)}
        </g>
      </g>

      <!-- Spatial Window Bottom Grab Handle (Standard Android XR indicator) -->
      <g transform="translate(${width / 2}, ${spatialY + spatialH + 24})">
        <rect x="-90" y="0" width="180" height="7" rx="3.5" fill="#ffffff" fill-opacity="0.65" />
      </g>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(outPath, buffer);
  console.log(`✓ Created: ${path.basename(outPath)}`);
}

// =============================================================
// CONTENT RENDERERS
// =============================================================

function renderDashboardScreen(w, h) {
  const topNavH = 54;
  const pad = 24;

  return `
    <rect width="${w}" height="${topNavH}" fill="#090d16" stroke="#1e293b" stroke-width="1" />
    <g transform="translate(24, 13)">
      <rect x="0" y="0" width="28" height="28" rx="8" fill="#4f46e5" />
      <text x="14" y="19" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="800" fill="#ffffff">P</text>
      <text x="38" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">LMS Bimbingan Bisnis PPSI</text>

      <g transform="translate(260, 0)">
        <rect x="0" y="0" width="105" height="30" rx="8" fill="#4f46e5" />
        <text x="52" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#ffffff">Dashboard</text>
        <text x="175" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Semua Materi</text>
        <text x="310" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Progress Belajar</text>
        <text x="430" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Profil Member</text>
      </g>

      <g transform="translate(${w - 230}, 0)">
        <circle cx="15" cy="15" r="14" fill="#312e81" stroke="#6366f1" stroke-width="1.5" />
        <text x="15" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#c7d2fe">CS</text>
        <text x="38" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#ffffff">Cecep Supriatna</text>
        <circle cx="170" cy="15" r="5" fill="#10b981" />
      </g>
    </g>

    <g transform="translate(${pad}, ${topNavH + pad})">
      <!-- Hero Banner -->
      <rect x="0" y="0" width="${w - pad * 2}" height="135" rx="18" fill="#1e1b4b" stroke="#4f46e5" stroke-width="1.5" />
      <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#a5b4fc" letter-spacing="1">DASHBOARD PEMBELAJARAN MEMBER</text>
      <text x="24" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="800" fill="#ffffff">Selamat datang kembali, Cecep Supriatna 👋</text>
      <text x="24" y="96" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="#cbd5e1">Yuk lanjutkan kurikulum belajar bisnis Anda. Target: Modul Riset Pasar &amp; Funnel Marketing.</text>

      <g transform="translate(${w - pad * 2 - 200}, 42)">
        <rect x="0" y="0" width="175" height="50" rx="14" fill="#4f46e5" />
        <polygon points="26,18 26,32 38,25" fill="#ffffff" />
        <text x="48" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Lanjut Belajar</text>
      </g>

      <!-- 4 Stats Cards in 1 Row -->
      <g transform="translate(0, 155)">
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 45) / 4}" height="95" rx="15" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="18" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="500" fill="#94a3b8">Total Materi Pembelajaran</text>
          <text x="18" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="800" fill="#ffffff">24</text>
          <text x="60" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">Modul</text>
        </g>

        <g transform="translate(${(w - pad * 2 - 45) / 4 + 15}, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 45) / 4}" height="95" rx="15" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="18" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="500" fill="#94a3b8">Modul Diselesaikan</text>
          <text x="18" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="800" fill="#10b981">18</text>
          <text x="60" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#10b981">✓ Selesai</text>
        </g>

        <g transform="translate(${((w - pad * 2 - 45) / 4 + 15) * 2}, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 45) / 4}" height="95" rx="15" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="18" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="500" fill="#94a3b8">Sedang Dipelajari</text>
          <text x="18" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="800" fill="#f59e0b">2</text>
          <text x="45" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#f59e0b">Aktif</text>
        </g>

        <g transform="translate(${((w - pad * 2 - 45) / 4 + 15) * 3}, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 45) / 4}" height="95" rx="15" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="18" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="500" fill="#94a3b8">Modul Terkunci</text>
          <text x="18" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="800" fill="#64748b">4</text>
          <text x="45" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">🔒 Lanjut</text>
        </g>
      </g>

      <!-- Bottom Split Section -->
      <g transform="translate(0, 270)">
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="${(w - pad * 2) * 0.48}" height="230" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">Progress Capaian Kurikulum</text>
          <text x="${(w - pad * 2) * 0.48 - 60}" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="800" fill="#10b981">75%</text>

          <rect x="24" y="58" width="${(w - pad * 2) * 0.48 - 48}" height="14" rx="7" fill="#1e293b" />
          <rect x="24" y="58" width="${((w - pad * 2) * 0.48 - 48) * 0.75}" height="14" rx="7" fill="#10b981" />

          <text x="24" y="98" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#94a3b8">18 dari 24 materi pembelajaran telah berhasil Anda kuasai.</text>

          <g transform="translate(24, 120)">
            <rect x="0" y="0" width="${(w - pad * 2) * 0.48 - 48}" height="68" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="34" cy="34" r="16" fill="#10b981" fill-opacity="0.2" />
            <text x="34" y="40" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#34d399">🏆</text>
            <text x="64" y="30" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13.5" font-weight="700" fill="#ffffff">Sertifikasi Modul Fundamental: Lulus</text>
            <text x="64" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#94a3b8">Tersertifikasi oleh Program Bimbingan Bisnis PPSI</text>
          </g>
        </g>

        <g transform="translate(${(w - pad * 2) * 0.50}, 0)">
          <rect x="0" y="0" width="${(w - pad * 2) * 0.50}" height="230" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">Materi Pembelajaran Terkini</text>

          <g transform="translate(24, 58)">
            <rect x="0" y="0" width="${(w - pad * 2) * 0.50 - 48}" height="64" rx="12" fill="#1e1b4b" stroke="#4f46e5" stroke-width="1" />
            <circle cx="30" cy="32" r="14" fill="#4f46e5" />
            <polygon points="27,25 27,39 37,32" fill="#ffffff" />
            <text x="56" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13.5" font-weight="700" fill="#ffffff">Modul 04: Riset Pasar &amp; Validasi Ide Produk</text>
            <text x="56" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#a5b4fc">Level Menengah • Sisa durasi: 12 menit video</text>
          </g>

          <g transform="translate(24, 134)">
            <rect x="0" y="0" width="${(w - pad * 2) * 0.50 - 48}" height="64" rx="12" fill="#111827" stroke="#1e293b" stroke-width="1" />
            <circle cx="30" cy="32" r="14" fill="#1e293b" />
            <text x="30" y="37" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">05</text>
            <text x="56" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13.5" font-weight="600" fill="#94a3b8">Modul 05: Optimalisasi Funnel Penjualan Digital</text>
            <text x="56" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#64748b">Siap dipelajari berikutnya • Durasi: 40 menit</text>
          </g>
        </g>
      </g>
    </g>
  `;
}

function renderMaterialsScreen(w, h) {
  const topNavH = 54;
  const pad = 24;

  return `
    <rect width="${w}" height="${topNavH}" fill="#090d16" stroke="#1e293b" stroke-width="1" />
    <g transform="translate(24, 13)">
      <rect x="0" y="0" width="28" height="28" rx="8" fill="#4f46e5" />
      <text x="14" y="19" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="800" fill="#ffffff">P</text>
      <text x="38" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">LMS Bimbingan Bisnis PPSI</text>

      <g transform="translate(260, 0)">
        <text x="52" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Dashboard</text>
        <rect x="110" y="0" width="125" height="30" rx="8" fill="#4f46e5" />
        <text x="172" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#ffffff">Semua Materi</text>
        <text x="310" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Progress Belajar</text>
        <text x="430" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Profil Member</text>
      </g>
    </g>

    <g transform="translate(${pad}, ${topNavH + pad})">
      <text x="0" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="800" fill="#ffffff">Katalog Modul Pembelajaran Bisnis</text>
      <text x="0" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#94a3b8">Pelajari setiap tahapan bisnis terstruktur dari mentor ahli PPSI</text>

      <g transform="translate(0, 60)">
        <rect x="0" y="0" width="380" height="42" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <circle cx="24" cy="21" r="6" fill="none" stroke="#64748b" stroke-width="2" />
        <line x1="28" y1="25" x2="35" y2="32" stroke="#64748b" stroke-width="2" />
        <text x="46" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#64748b">Cari judul materi bisnis...</text>

        <g transform="translate(400, 0)">
          <rect x="0" y="0" width="80" height="42" rx="12" fill="#4f46e5" />
          <text x="40" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="700" fill="#ffffff">Semua</text>

          <rect x="95" y="0" width="125" height="42" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="157" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#94a3b8">Fundamental</text>

          <rect x="235" y="0" width="115" height="42" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="292" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#94a3b8">Pemasaran</text>

          <rect x="365" y="0" width="105" height="42" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="417" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#94a3b8">Keuangan</text>
        </g>
      </g>

      <g transform="translate(0, 125)">
        <!-- Card 1 -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 32) / 3}" height="310" rx="16" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
          <rect x="2" y="2" width="${(w - pad * 2 - 32) / 3 - 4}" height="135" rx="14" fill="#1e1b4b" />
          <circle cx="${((w - pad * 2 - 32) / 3) / 2}" cy="68" r="22" fill="#10b981" fill-opacity="0.8" />
          <text x="${((w - pad * 2 - 32) / 3) / 2}" y="74" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" fill="#ffffff">✓</text>
          <rect x="14" y="14" width="65" height="22" rx="5" fill="#10b981" />
          <text x="46" y="29" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" font-weight="700" fill="#ffffff">SELESAI</text>

          <text x="18" y="168" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">01. Pola Pikir &amp; Ekosistem Bisnis</text>
          <text x="18" y="190" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">Pondasi dasar dan mindset scale-up bisnis member PPSI.</text>
          <text x="18" y="225" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#64748b">⏱ 28 Menit Video • 4 Lampiran PDF</text>

          <g transform="translate(18, 252)">
            <rect x="0" y="0" width="${(w - pad * 2 - 32) / 3 - 36}" height="40" rx="10" fill="#1e293b" />
            <text x="${((w - pad * 2 - 32) / 3 - 36) / 2}" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="600" fill="#a5b4fc">Tinjau Kembali</text>
          </g>
        </g>

        <!-- Card 2 -->
        <g transform="translate(${(w - pad * 2 - 32) / 3 + 16}, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 32) / 3}" height="310" rx="16" fill="#1e1b4b" stroke="#4f46e5" stroke-width="2" />
          <rect x="2" y="2" width="${(w - pad * 2 - 32) / 3 - 4}" height="135" rx="14" fill="#312e81" />
          <circle cx="${((w - pad * 2 - 32) / 3) / 2}" cy="68" r="24" fill="#4f46e5" />
          <polygon points="${((w - pad * 2 - 32) / 3) / 2 - 5},58 ${((w - pad * 2 - 32) / 3) / 2 - 5},78 ${((w - pad * 2 - 32) / 3) / 2 + 9},68" fill="#ffffff" />
          <rect x="14" y="14" width="110" height="22" rx="5" fill="#4f46e5" />
          <text x="69" y="29" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" font-weight="700" fill="#ffffff">SEDANG BELAJAR</text>

          <text x="18" y="168" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">02. Riset Pasar &amp; Segmentasi</text>
          <text x="18" y="190" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#cbd5e1">Strategi mengenali pelanggan ideal dan diferensiasi brand.</text>
          <text x="18" y="225" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#c7d2fe">⏱ 35 Menit Video • 6 Lembar Kerja</text>

          <g transform="translate(18, 252)">
            <rect x="0" y="0" width="${(w - pad * 2 - 32) / 3 - 36}" height="40" rx="10" fill="#4f46e5" />
            <text x="${((w - pad * 2 - 32) / 3 - 36) / 2}" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="700" fill="#ffffff">Lanjut Belajar</text>
          </g>
        </g>

        <!-- Card 3 -->
        <g transform="translate(${((w - pad * 2 - 32) / 3 + 16) * 2}, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 32) / 3}" height="310" rx="16" fill="#0a0e1a" stroke="#1e293b" stroke-width="1.5" />
          <rect x="2" y="2" width="${(w - pad * 2 - 32) / 3 - 4}" height="135" rx="14" fill="#111827" />
          <circle cx="${((w - pad * 2 - 32) / 3) / 2}" cy="68" r="22" fill="#1e293b" />
          <text x="${((w - pad * 2 - 32) / 3) / 2}" y="74" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" fill="#64748b">🔒</text>
          <rect x="14" y="14" width="75" height="22" rx="5" fill="#1e293b" />
          <text x="51" y="29" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" font-weight="600" fill="#64748b">TERKUNCI</text>

          <text x="18" y="168" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#64748b">03. Funnel Penjualan &amp; Closing</text>
          <text x="18" y="190" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#475569">Optimalisasi konversi prospek menjadi transaksi loyal.</text>
          <text x="18" y="225" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#475569">Selesaikan modul 02 untuk membuka</text>

          <g transform="translate(18, 252)">
            <rect x="0" y="0" width="${(w - pad * 2 - 32) / 3 - 36}" height="40" rx="10" fill="#111827" stroke="#1e293b" stroke-width="1" />
            <text x="${((w - pad * 2 - 32) / 3 - 36) / 2}" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">Modul Terkunci</text>
          </g>
        </g>
      </g>
    </g>
  `;
}

function renderVideoDetailScreen(w, h) {
  const topNavH = 54;
  const pad = 24;
  const videoW = (w - pad * 2) * 0.65;
  const sidebarW = (w - pad * 2) * 0.33;

  return `
    <rect width="${w}" height="${topNavH}" fill="#090d16" stroke="#1e293b" stroke-width="1" />
    <g transform="translate(24, 13)">
      <rect x="0" y="0" width="28" height="28" rx="8" fill="#4f46e5" />
      <text x="14" y="19" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="800" fill="#ffffff">P</text>
      <text x="38" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">LMS Bimbingan Bisnis PPSI</text>
      <text x="260" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#64748b">← Kembali ke Daftar Modul</text>
    </g>

    <g transform="translate(${pad}, ${topNavH + pad})">
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="${videoW}" height="310" rx="16" fill="#090d16" stroke="#334155" stroke-width="1.5" />
        <rect x="2" y="2" width="${videoW - 4}" height="306" rx="14" fill="#1e1b4b" fill-opacity="0.85" />

        <circle cx="${videoW / 2}" cy="145" r="36" fill="#4f46e5" stroke="#ffffff" stroke-width="2" />
        <polygon points="${videoW / 2 - 8},132 ${videoW / 2 - 8},158 ${videoW / 2 + 13},145" fill="#ffffff" />

        <rect x="20" y="270" width="${videoW - 40}" height="6" rx="3" fill="#334155" />
        <rect x="20" y="270" width="${(videoW - 40) * 0.45}" height="6" rx="3" fill="#818cf8" />
        <circle cx="${20 + (videoW - 40) * 0.45}" cy="273" r="5" fill="#ffffff" />
        <text x="${videoW - 20}" y="262" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#94a3b8">15:20 / 35:00</text>

        <g transform="translate(0, 335)">
          <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="19" font-weight="800" fill="#ffffff">Modul 02: Riset Pasar &amp; Segmentasi Konsumen Potensial</text>
          <text x="0" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#818cf8">Seri Bimbingan Bisnis PPSI • Mentor Pengampu: Tim Bisnis &amp; Praktisi</text>

          <rect x="0" y="60" width="${videoW}" height="120" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="18" y="26" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13.5" font-weight="700" fill="#ffffff" transform="translate(0, 60)">Rangkuman Poin Penting Modul:</text>
          <g transform="translate(18, 105)">
            <circle cx="5" cy="5" r="3" fill="#10b981" />
            <text x="18" y="9" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#cbd5e1">Teknik validasi minat pasar sebelum memproduksi barang dalam skala besar.</text>
            <circle cx="5" cy="27" r="3" fill="#10b981" />
            <text x="18" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#cbd5e1">Menemukan Unique Selling Proposition (USP) yang tidak dimiliki kompetitor.</text>
          </g>
        </g>
      </g>

      <!-- Sidebar -->
      <g transform="translate(${videoW + 20}, 0)">
        <rect x="0" y="0" width="${sidebarW}" height="520" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <text x="20" y="34" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">Daftar Modul Belajar</text>
        <text x="20" y="52" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#94a3b8">Kurikulum Bimbingan Bisnis PPSI</text>

        <g transform="translate(16, 70)">
          <rect x="0" y="0" width="${sidebarW - 32}" height="60" rx="10" fill="#1e293b" />
          <circle cx="25" cy="30" r="11" fill="#10b981" fill-opacity="0.2" />
          <text x="25" y="34" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#34d399">✓</text>
          <text x="48" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="600" fill="#ffffff">01. Pola Pikir &amp; Visi Bisnis</text>
          <text x="48" y="42" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" fill="#10b981">Selesai • 28 Menit</text>

          <g transform="translate(0, 70)">
            <rect x="0" y="0" width="${sidebarW - 32}" height="60" rx="10" fill="#1e1b4b" stroke="#4f46e5" stroke-width="1.5" />
            <circle cx="25" cy="30" r="11" fill="#4f46e5" />
            <polygon points="22,25 22,35 31,30" fill="#ffffff" />
            <text x="48" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="700" fill="#ffffff">02. Riset Pasar &amp; Segmentasi</text>
            <text x="48" y="42" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" fill="#a5b4fc">Sedang Diputar • 35 Menit</text>
          </g>

          <g transform="translate(0, 140)">
            <rect x="0" y="0" width="${sidebarW - 32}" height="60" rx="10" fill="#111827" stroke="#1e293b" stroke-width="1" />
            <circle cx="25" cy="30" r="11" fill="#1e293b" />
            <text x="25" y="34" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b">🔒</text>
            <text x="48" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="600" fill="#64748b">03. Funnel Penjualan &amp; Closing</text>
            <text x="48" y="42" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" fill="#475569">Terkunci • 40 Menit</text>
          </g>

          <g transform="translate(0, 210)">
            <rect x="0" y="0" width="${sidebarW - 32}" height="60" rx="10" fill="#111827" stroke="#1e293b" stroke-width="1" />
            <circle cx="25" cy="30" r="11" fill="#1e293b" />
            <text x="25" y="34" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#64748b">🔒</text>
            <text x="48" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="600" fill="#64748b">04. Manajemen Arus Kas Bisnis</text>
            <text x="48" y="42" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" fill="#475569">Terkunci • 50 Menit</text>
          </g>
        </g>

        <g transform="translate(16, 445)">
          <rect x="0" y="0" width="${sidebarW - 32}" height="50" rx="14" fill="#10b981" />
          <text x="${(sidebarW - 32) / 2}" y="31" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff">✓ Tandai Selesai &amp; Lanjut</text>
        </g>
      </g>
    </g>
  `;
}

function renderProgressScreen(w, h) {
  const topNavH = 54;
  const pad = 24;

  return `
    <rect width="${w}" height="${topNavH}" fill="#090d16" stroke="#1e293b" stroke-width="1" />
    <g transform="translate(24, 13)">
      <rect x="0" y="0" width="28" height="28" rx="8" fill="#4f46e5" />
      <text x="14" y="19" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="800" fill="#ffffff">P</text>
      <text x="38" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">LMS Bimbingan Bisnis PPSI</text>

      <g transform="translate(260, 0)">
        <text x="52" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Dashboard</text>
        <text x="175" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Semua Materi</text>
        <rect x="250" y="0" width="130" height="30" rx="8" fill="#4f46e5" />
        <text x="315" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="600" fill="#ffffff">Progress Belajar</text>
        <text x="430" y="20" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Profil Member</text>
      </g>
    </g>

    <g transform="translate(${pad}, ${topNavH + pad})">
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="${w - pad * 2}" height="110" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <circle cx="55" cy="55" r="34" fill="#4f46e5" />
        <text x="55" y="62" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="#ffffff">CS</text>

        <text x="110" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="19" font-weight="700" fill="#ffffff">Cecep Supriatna</text>
        <text x="110" y="70" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#94a3b8">Status: Member Bimbingan Bisnis Terverifikasi PPSI</text>

        <rect x="${w - pad * 2 - 200}" y="38" width="175" height="34" rx="10" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.2" />
        <text x="${w - pad * 2 - 112}" y="60" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" font-weight="700" fill="#34d399">✓ Keanggotaan Aktif</text>
      </g>

      <g transform="translate(0, 130)">
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 20) * 0.58}" height="350" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">Aktivitas Belajar Mingguan (Jam)</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#94a3b8">Konsistensi modul yang diselesaikan per hari</text>

          <g transform="translate(30, 105)">
            <rect x="20" y="70" width="42" height="110" rx="8" fill="#312e81" />
            <text x="41" y="205" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">Senin</text>
            <text x="41" y="60" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#a5b4fc">2.5j</text>

            <rect x="90" y="40" width="42" height="140" rx="8" fill="#4f46e5" />
            <text x="111" y="205" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">Selasa</text>
            <text x="111" y="30" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#a5b4fc">3.8j</text>

            <rect x="160" y="85" width="42" height="95" rx="8" fill="#312e81" />
            <text x="181" y="205" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">Rabu</text>
            <text x="181" y="75" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#a5b4fc">1.8j</text>

            <rect x="230" y="25" width="42" height="155" rx="8" fill="#6366f1" />
            <text x="251" y="205" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">Kamis</text>
            <text x="251" y="15" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#a5b4fc">4.2j</text>

            <rect x="300" y="55" width="42" height="125" rx="8" fill="#4f46e5" />
            <text x="321" y="205" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#64748b">Jumat</text>
            <text x="321" y="45" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#a5b4fc">3.0j</text>

            <rect x="370" y="10" width="42" height="170" rx="8" fill="#10b981" />
            <text x="391" y="205" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12.5" fill="#10b981" font-weight="700">Sabtu</text>
            <text x="391" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#34d399" font-weight="700">5.0j</text>
          </g>
        </g>

        <g transform="translate(${(w - pad * 2 - 20) * 0.58 + 20}, 0)">
          <rect x="0" y="0" width="${(w - pad * 2 - 20) * 0.42}" height="350" rx="18" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
          <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ffffff">Pencapaian &amp; Sertifikat</text>

          <g transform="translate(18, 60)">
            <rect x="0" y="0" width="${(w - pad * 2 - 20) * 0.42 - 36}" height="74" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="34" cy="37" r="16" fill="#10b981" fill-opacity="0.2" />
            <text x="34" y="43" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#34d399">🏆</text>
            <text x="64" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Modul Fundamental Bisnis</text>
            <text x="64" y="50" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#10b981">Telah Lulus Evaluasi • Skor 96/100</text>
          </g>

          <g transform="translate(18, 150)">
            <rect x="0" y="0" width="${(w - pad * 2 - 20) * 0.42 - 36}" height="74" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <circle cx="34" cy="37" r="16" fill="#6366f1" fill-opacity="0.2" />
            <text x="34" y="43" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#a5b4fc">🎖</text>
            <text x="64" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Studi Kasus Riset Pasar</text>
            <text x="64" y="50" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#a5b4fc">Disetujui Mentor Pendamping PPSI</text>
          </g>

          <g transform="translate(18, 240)">
            <rect x="0" y="0" width="${(w - pad * 2 - 20) * 0.42 - 36}" height="74" rx="12" fill="#111827" stroke="#1e293b" stroke-width="1" />
            <circle cx="34" cy="37" r="16" fill="#1e293b" />
            <text x="34" y="43" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" fill="#64748b">🔒</text>
            <text x="64" y="31" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#64748b">Scale-Up &amp; Kelola Arus Kas</text>
            <text x="64" y="50" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" fill="#475569">Selesaikan kurikulum lanjutan</text>
          </g>
        </g>
      </g>
    </g>
  `;
}

// =============================================================
// MAIN EXECUTION
// =============================================================
async function run() {
  console.log("=== 1. Generating Tablet 7-inch Screenshots (2048 x 1536) ===");
  await createTabletScreenshot({
    outPath: path.join(tablet7Dir, "screenshot-1-dashboard-tablet7.png"),
    width: 2048,
    height: 1536,
    badgeText: "TABLET 7 INCI",
    titleText: "Dashboard Terpadu &amp; Responsif",
    subText: "Pantau kemajuan modul dan akses cepat materi langsung di layar tablet",
    accentColor: "#10b981",
    renderContentSvg: renderDashboardScreen,
  });

  await createTabletScreenshot({
    outPath: path.join(tablet7Dir, "screenshot-2-materials-tablet7.png"),
    width: 2048,
    height: 1536,
    badgeText: "KURIKULUM BISNIS",
    titleText: "Katalog Modul Berjenjang",
    subText: "Pencarian modul praktis dari dasar hingga strategi scale-up bisnis",
    accentColor: "#3b82f6",
    renderContentSvg: renderMaterialsScreen,
  });

  await createTabletScreenshot({
    outPath: path.join(tablet7Dir, "screenshot-3-video-tablet7.png"),
    width: 2048,
    height: 1536,
    badgeText: "STUDI KASUS",
    titleText: "Video Materi &amp; Agenda Modul",
    subText: "Simak video audio visual lengkap disertai ringkasan materi praktis",
    accentColor: "#8b5cf6",
    renderContentSvg: renderVideoDetailScreen,
  });

  await createTabletScreenshot({
    outPath: path.join(tablet7Dir, "screenshot-4-progress-tablet7.png"),
    width: 2048,
    height: 1536,
    badgeText: "EVALUASI CAPAIAN",
    titleText: "Tracking Milestone &amp; Sertifikasi",
    subText: "Pantau grafik konsistensi belajar harian dan verifikasi kelulusan modul",
    accentColor: "#ec4899",
    renderContentSvg: renderProgressScreen,
  });

  console.log("\n=== 2. Generating Tablet 10-inch Screenshots (2560 x 1600) ===");
  await createTabletScreenshot({
    outPath: path.join(tablet10Dir, "screenshot-1-dashboard-tablet10.png"),
    width: 2560,
    height: 1600,
    badgeText: "TABLET 10 INCI",
    titleText: "Tampilan Luas &amp; Maksimal",
    subText: "Pengalaman belajar interaktif di tablet besar dengan visual jernih",
    accentColor: "#10b981",
    renderContentSvg: renderDashboardScreen,
  });

  await createTabletScreenshot({
    outPath: path.join(tablet10Dir, "screenshot-2-materials-tablet10.png"),
    width: 2560,
    height: 1600,
    badgeText: "KURIKULUM LENGKAP",
    titleText: "Eksplorasi Kurikulum Komprehensif",
    subText: "Pilah materi sesuai kebutuhan bisnis Anda secara terstruktur",
    accentColor: "#3b82f6",
    renderContentSvg: renderMaterialsScreen,
  });

  await createTabletScreenshot({
    outPath: path.join(tablet10Dir, "screenshot-3-video-tablet10.png"),
    width: 2560,
    height: 1600,
    badgeText: "VIDEO INTERAKTIF",
    titleText: "Pemutar Video Pembelajaran Jernih",
    subText: "Akses panduan video berkualitas tinggi dan daftar modul interaktif",
    accentColor: "#8b5cf6",
    renderContentSvg: renderVideoDetailScreen,
  });

  await createTabletScreenshot({
    outPath: path.join(tablet10Dir, "screenshot-4-progress-tablet10.png"),
    width: 2560,
    height: 1600,
    badgeText: "MONITORING CAPAIAN",
    titleText: "Evaluasi Perkembangan Belajar",
    subText: "Lacak milestone sertifikasi member dan grafik aktivitas mingguan",
    accentColor: "#ec4899",
    renderContentSvg: renderProgressScreen,
  });

  console.log("\n=== 3. Generating Chromebook / Desktop Screenshots (1920 x 1080) ===");
  await createDesktopScreenshot({
    outPath: path.join(desktopDir, "screenshot-1-dashboard-desktop.png"),
    badgeText: "CHROMEBOOK &amp; DESKTOP",
    titleText: "Dashboard Terintegrasi di Desktop",
    subText: "Akses fleksibel melalui peramban web dan perangkat Chromebook / Desktop",
    accentColor: "#6366f1",
    renderContentSvg: renderDashboardScreen,
  });

  await createDesktopScreenshot({
    outPath: path.join(desktopDir, "screenshot-2-materials-desktop.png"),
    badgeText: "KATALOG KURIKULUM",
    titleText: "Eksplorasi Modul Bisnis Desktop",
    subText: "Filter cepat modul pembelajaran terstruktur dengan tampilan grid luas",
    accentColor: "#3b82f6",
    renderContentSvg: renderMaterialsScreen,
  });

  await createDesktopScreenshot({
    outPath: path.join(desktopDir, "screenshot-3-video-detail-desktop.png"),
    badgeText: "PEMBELAJARAN VIDEO",
    titleText: "Materi Video &amp; Catatan Studi Kasus",
    subText: "Simak video tutorial praktis berdampingan dengan agenda materi belajar",
    accentColor: "#8b5cf6",
    renderContentSvg: renderVideoDetailScreen,
  });

  await createDesktopScreenshot({
    outPath: path.join(desktopDir, "screenshot-4-progress-desktop.png"),
    badgeText: "ANALITIK BELAJAR",
    titleText: "Pantau Jam Belajar &amp; Capaian Member",
    subText: "Pantau perkembangan keahlian bisnis Anda secara visual dan terukur",
    accentColor: "#10b981",
    renderContentSvg: renderProgressScreen,
  });

  console.log("\n=== 4. Generating Android XR / Spatial Computing Screenshots (1920 x 1080) ===");
  await createAndroidXrScreenshot({
    outPath: path.join(xrDir, "screenshot-1-spatial-dashboard.png"),
    badgeText: "ANDROID XR SPATIAL",
    titleText: "Dashboard Spasial Interaktif",
    subText: "Pengalaman belajar immersive di ruang virtual dengan floating window multitasking",
    accentColor: "#6366f1",
    renderContentSvg: renderDashboardScreen,
  });

  await createAndroidXrScreenshot({
    outPath: path.join(xrDir, "screenshot-2-spatial-materials.png"),
    badgeText: "MULTI-WINDOW XR",
    titleText: "Kurikulum Spasial Berjenjang",
    subText: "Eksplorasi modul kurikulum bisnis di kanvas virtual spasial yang luas",
    accentColor: "#3b82f6",
    renderContentSvg: renderMaterialsScreen,
  });

  await createAndroidXrScreenshot({
    outPath: path.join(xrDir, "screenshot-3-virtual-theater-video.png"),
    badgeText: "VIRTUAL CINEMA",
    titleText: "Pemutar Video Pembelajaran Imersif",
    subText: "Tonton materi bimbingan bisnis dalam format layar bioskop spasial jernih",
    accentColor: "#8b5cf6",
    renderContentSvg: renderVideoDetailScreen,
  });

  await createAndroidXrScreenshot({
    outPath: path.join(xrDir, "screenshot-4-spatial-progress.png"),
    badgeText: "ANALITIK 3D",
    titleText: "Evaluasi Milestone Belajar Spasial",
    subText: "Pantau konsistensi jam belajar dan status verifikasi sertifikat member",
    accentColor: "#10b981",
    renderContentSvg: renderProgressScreen,
  });

  console.log("\n✨ ALL FORM FACTORS (Tablet 7\", Tablet 10\", Desktop, Android XR) GENERATED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("Error generating assets:", err);
  process.exit(1);
});
