/**
 * App Store Connect screenshots from simulator/phone captures.
 *
 * Default (--connect): exact pixel size, full app screen — does NOT change in-app UI.
 * Optional (--marketing): bright headline + phone frame for store preview only.
 */
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseDir = join(root, "docs/app-store-screenshots");
const capturesDir = join(baseDir, "captures");

const IPHONE = { w: 1284, h: 2778 };
const IPAD_TARGETS = [
  { dir: "ipad-13-inch", w: 2064, h: 2752 },
  { dir: "ipad-12.9-inch", w: 2048, h: 2732 },
];

const BG = { r: 7, g: 13, b: 24, alpha: 1 };

/** Matches app tokens / CalmScreen gradient — calm dark, not bright marketing blue. */
const PULSATION = {
  bgTop: "#0A1222",
  bgMid: "#070D18",
  bgBottom: "#081021",
  textPrimary: "#BCC8DA",
  textSecondary: "#74839A",
  circlesRing: "#3D5A82",
  circlesInner: "#1C2F4A",
  phoneBorder: "#3D5A82",
  phoneFill: "#070D18",
};

const SLIDE_NAMES = [
  "01-onboarding",
  "02-trigger",
  "03-action",
  "04-return",
  "05-about",
];

const SLIDES_EN = SLIDE_NAMES.map((base) => ({
  capture: `${base}-1284x2778.png`,
  output: `${base}-1284x2778.png`,
  headline:
    base === "01-onboarding"
      ? "How it works"
      : base === "02-trigger"
        ? "One action for you"
        : base === "03-action"
          ? "Feet on the ground"
          : base === "04-return"
            ? "You are here"
            : "Calm, not pressure",
  sub:
    base === "01-onboarding"
      ? "Four steps — then tap circles"
      : base === "02-trigger"
        ? "Tap circles to begin"
        : base === "03-action"
          ? "Seven calm micro-actions"
          : base === "04-return"
            ? "Settle back into the moment"
            : "Minimal wellbeing, on device",
}));

const SLIDES_UK = SLIDE_NAMES.map((base) => ({
  capture: `${base}-1284x2778.png`,
  output: `${base}-1284x2778.png`,
  headline:
    base === "01-onboarding"
      ? "Як це працює"
      : base === "02-trigger"
        ? "Одна дія для тебе"
        : base === "03-action"
          ? "Стопи на опорі"
          : base === "04-return"
            ? "Ти тут"
            : "Спокій, не тиск",
  sub:
    base === "01-onboarding"
      ? "Чотири кроки — потім торкнись кіл"
      : base === "02-trigger"
        ? "Торкнись кіл, щоб почати"
        : base === "03-action"
          ? "Сім спокійних мікродій"
          : base === "04-return"
            ? "Повернись у теперішній момент"
            : "Мінімалізм — лише на пристрої",
}));

const PHONE = { y: 500, outerW: 952, outerH: 2060, radius: 52, pad: 12 };

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapHeadline(text, maxCharsPerLine = 22) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxCharsPerLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function marketingRingsMarkup(cx, cy, scale) {
  const rings = [
    { r: 67.4, opacity: 0.35, sw: 1.4 },
    { r: 54.4, opacity: 0.5, sw: 1.2 },
    { r: 42.4, opacity: 0.58, sw: 1.2 },
    { r: 30.4, opacity: 0.66, sw: 1.1 },
    { r: 18.4, opacity: 0.74, sw: 1.1 },
  ];
  const circles = rings
    .map(
      ({ r, opacity, sw }) =>
        `<circle cx="${cx}" cy="${cy}" r="${(r * scale).toFixed(1)}" fill="none" stroke="${PULSATION.circlesRing}" stroke-width="${sw}" opacity="${opacity}"/>`,
    )
    .join("\n    ");
  const dot = `<circle cx="${cx}" cy="${cy}" r="${(5 * scale).toFixed(1)}" fill="${PULSATION.circlesInner}" opacity="0.92"/>`;
  return `${circles}\n    ${dot}`;
}

function marketingFrameSvg({ headline, sub }) {
  const { w: W, h: H } = IPHONE;
  const cx = W / 2;
  const lines = wrapHeadline(headline, /[а-яіїєґ]/i.test(headline) ? 18 : 22);
  const lineHeight = 92;
  const headlineBlockH = lines.length * lineHeight;
  const headlineStartY = 200 + Math.max(0, (280 - headlineBlockH) / 2);
  const headlineTspans = lines
    .map((line, i) => {
      const y = headlineStartY + i * lineHeight;
      return `<tspan x="${cx}" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  const circlesCx = W - 200;
  const circlesCy = 300;
  const ringsMarkup = marketingRingsMarkup(circlesCx, circlesCy, 0.55);
  const phoneX = Math.round((W - PHONE.outerW) / 2);
  const innerX = phoneX + PHONE.pad;
  const innerY = PHONE.y + PHONE.pad;
  const innerW = PHONE.outerW - PHONE.pad * 2;
  const innerH = PHONE.outerH - PHONE.pad * 2;
  const innerR = PHONE.radius - 8;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PULSATION.bgTop}"/>
      <stop offset="55%" stop-color="${PULSATION.bgMid}"/>
      <stop offset="100%" stop-color="${PULSATION.bgBottom}"/>
    </linearGradient>
    <radialGradient id="softGlow" cx="50%" cy="18%" r="55%">
      <stop offset="0%" stop-color="${PULSATION.circlesRing}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${PULSATION.bgMid}" stop-opacity="0"/>
    </radialGradient>
    <filter id="phoneShadow" x="-15%" y="-8%" width="130%" height="115%">
      <feDropShadow dx="0" dy="20" stdDeviation="28" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#softGlow)"/>
  <g opacity="0.9">${ringsMarkup}</g>
  <text text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="600" fill="${PULSATION.textPrimary}">${headlineTspans}</text>
  <text x="${cx}" y="${headlineStartY + headlineBlockH + 56}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="400" fill="${PULSATION.textSecondary}" opacity="0.95">${escapeXml(sub)}</text>
  <rect x="${phoneX}" y="${PHONE.y}" width="${PHONE.outerW}" height="${PHONE.outerH}" rx="${PHONE.radius}" fill="${PULSATION.phoneFill}" stroke="${PULSATION.phoneBorder}" stroke-width="2.5" opacity="0.95" filter="url(#phoneShadow)"/>
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerR}" fill="${PULSATION.bgMid}"/>
</svg>`;
}

function capturePath(slide) {
  const named = join(capturesDir, slide.capture);
  if (existsSync(named)) return named;
  throw new Error(
    `Missing ${slide.capture} in docs/app-store-screenshots/captures/\n` +
      "Put raw simulator screenshots there (see README).",
  );
}

/** Exact Connect size — app UI unchanged, letterbox if aspect differs. */
async function writeConnectPng(inputPath, outputPath) {
  const { w, h } = IPHONE;
  await sharp(inputPath)
    .resize(w, h, { fit: "contain", background: BG })
    .png({ compressionLevel: 9, force: true })
    .toColorspace("srgb")
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  if (meta.width !== w || meta.height !== h) {
    throw new Error(`${outputPath}: expected ${w}×${h}, got ${meta.width}×${meta.height}`);
  }
}

async function writeMarketingPng(slide, inputPath, outputPath) {
  const { w: W, h: H } = IPHONE;
  const innerW = PHONE.outerW - PHONE.pad * 2;
  const innerH = PHONE.outerH - PHONE.pad * 2;
  const innerX = Math.round((W - PHONE.outerW) / 2) + PHONE.pad;
  const innerY = PHONE.y + PHONE.pad;

  const isOnboarding = slide.capture.startsWith("01-onboarding");
  const fitted = await sharp(inputPath)
    .resize(innerW, innerH, {
      fit: isOnboarding ? "contain" : "cover",
      position: isOnboarding ? "top" : "centre",
      background: BG,
    })
    .png()
    .toBuffer();

  const framePng = await sharp(Buffer.from(marketingFrameSvg(slide))).png().toBuffer();
  await sharp(framePng)
    .composite([{ input: fitted, left: innerX, top: innerY }])
    .resize(W, H, { fit: "fill" })
    .png({ force: true })
    .toColorspace("srgb")
    .toFile(outputPath);
}

async function writeIpadFromIphone(iphoneDir) {
  for (const { dir, w, h } of IPAD_TARGETS) {
    const targetDir = join(baseDir, dir);
    mkdirSync(targetDir, { recursive: true });
    for (const slide of SLIDES_EN) {
      const base = slide.output.replace("-1284x2778", "");
      const outName = `${base}-${w}x${h}.png`;
      await sharp(join(iphoneDir, slide.output))
        .resize(w, h, { fit: "contain", background: BG })
        .png({ force: true })
        .toColorspace("srgb")
        .toFile(join(targetDir, outName));
    }
  }
}

function listCaptures() {
  if (!existsSync(capturesDir)) return [];
  return readdirSync(capturesDir).filter((f) => f.endsWith(".png"));
}

const marketing = process.argv.includes("--marketing");
const locale = process.argv.includes("--locale=uk") ? "uk" : "en";
const slides = locale === "uk" ? SLIDES_UK : SLIDES_EN;
const outSubdir = marketing ? "marketing" : "connect";
const targetDir = join(baseDir, locale === "uk" ? join(outSubdir, "uk") : outSubdir);

async function main() {
  mkdirSync(capturesDir, { recursive: true });
  mkdirSync(targetDir, { recursive: true });

  const found = listCaptures();
  if (found.length === 0) {
    console.error("No PNG files in docs/app-store-screenshots/captures/");
    console.error("Add 5 simulator screenshots named e.g. 01-onboarding-1284x2778.png");
    process.exit(1);
  }

  for (const slide of slides) {
    const input = capturePath(slide);
    const output = join(targetDir, slide.output);
    if (marketing) {
      await writeMarketingPng(slide, input, output);
    } else {
      await writeConnectPng(input, output);
    }
    const meta = await sharp(output).metadata();
    console.log(`Wrote ${output} (${meta.width}×${meta.height})`);
  }

  if (locale === "en" && !marketing) {
    await writeIpadFromIphone(targetDir);
    console.log("Wrote iPad variants in ipad-13-inch/ and ipad-12.9-inch/");
  }

  console.log(
    marketing
      ? "\nMarketing frames (optional). For Connect upload use: npm run generate:screenshots"
      : "\nUpload files from docs/app-store-screenshots/connect/ to App Store Connect.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
