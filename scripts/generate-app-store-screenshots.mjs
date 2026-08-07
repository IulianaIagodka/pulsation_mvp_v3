/**
 * App Store Connect screenshots from simulator/phone captures.
 *
 * Default (--connect): exact pixel size, full app screen — does NOT change in-app UI.
 * Optional (--marketing): benefit headline + phone frame for store preview (conversion set).
 * Optional (--story=product): older feature-focused marketing headlines.
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

/** Matches app tokens / CalmScreen gradient — calmer dark with brighter store headlines. */
const PULSATION = {
  bgTop: "#0E1A2E",
  bgMid: "#070D18",
  bgBottom: "#050A14",
  textPrimary: "#E8EEF7",
  textSecondary: "#9AABC2",
  circlesRing: "#4A6F9E",
  circlesInner: "#1C2F4A",
  phoneBorder: "#4A6F9E",
  phoneFill: "#070D18",
};

const SLIDE_NAMES = [
  "01-onboarding",
  "02-trigger",
  "03-action",
  "04-return",
  "05-about",
];

/** Conversion set — pain → benefit → proof → outcome → differentiator. */
const CONVERSION_EN = {
  "01-onboarding": {
    headline: "Stuck scrolling?",
    sub: "One gentle action to reset",
  },
  "02-trigger": {
    headline: "A quiet invitation",
    sub: "When the phone sits nearby",
  },
  "03-action": {
    headline: "One small action",
    sub: "Feel your feet. One slow breath.",
  },
  "04-return": {
    headline: "Back to yourself",
    sub: "You are here — present again",
  },
  "05-about": {
    headline: "No streaks. No feed.",
    sub: "Minimal wellbeing, on device",
  },
};

const CONVERSION_UK = {
  "01-onboarding": {
    headline: "Застрягли в скролі?",
    sub: "Одна м’яка дія — і ти знову тут",
  },
  "02-trigger": {
    headline: "Тихе запрошення",
    sub: "Коли телефон просто поруч",
  },
  "03-action": {
    headline: "Одна маленька дія",
    sub: "Відчуй стопи. Один повільний подих.",
  },
  "04-return": {
    headline: "Повернися до себе",
    sub: "Ти тут — знову в моменті",
  },
  "05-about": {
    headline: "Без серій і стрічки",
    sub: "Мінімум. Лише на твоєму пристрої",
  },
};

/** Older product/feature headlines (kept for A/B). */
const PRODUCT_EN = {
  "01-onboarding": { headline: "How it works", sub: "Scrolling → action → background" },
  "02-trigger": { headline: "One action for you", sub: "Tap circles to begin" },
  "03-action": { headline: "Feet on the ground", sub: "Seven calm micro-actions" },
  "04-return": { headline: "You are here", sub: "Settle back into the moment" },
  "05-about": { headline: "Calm, not pressure", sub: "Minimal wellbeing, on device" },
};

const PRODUCT_UK = {
  "01-onboarding": { headline: "Як це працює", sub: "Скрол → дія → фон" },
  "02-trigger": { headline: "Одна дія для тебе", sub: "Торкнись кіл, щоб почати" },
  "03-action": { headline: "Стопи на опорі", sub: "Сім спокійних мікродій" },
  "04-return": { headline: "Ти тут", sub: "Повернись у теперішній момент" },
  "05-about": { headline: "Спокій, не тиск", sub: "Мінімалізм — лише на пристрої" },
};

const storyArg = process.argv.find((a) => a.startsWith("--story="));
const story = storyArg?.slice("--story=".length) === "product" ? "product" : "conversion";
const marketing = process.argv.includes("--marketing");
const locale = process.argv.includes("--locale=uk") ? "uk" : "en";

const storyMap =
  story === "product"
    ? locale === "uk"
      ? PRODUCT_UK
      : PRODUCT_EN
    : locale === "uk"
      ? CONVERSION_UK
      : CONVERSION_EN;

const slides = SLIDE_NAMES.map((base) => ({
  base,
  capture: `${base}-1284x2778.png`,
  output: `${base}-1284x2778.png`,
  headline: storyMap[base].headline,
  sub: storyMap[base].sub,
}));

/** UK marketing → top-level uk/ (Connect locale slot). EN marketing → marketing/. */
const outSubdir = marketing
  ? locale === "uk"
    ? "uk"
    : "marketing"
  : locale === "uk"
    ? join("connect", "uk")
    : "connect";
const targetDir = join(baseDir, outSubdir);

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
    { r: 67.4, opacity: 0.4, sw: 1.4 },
    { r: 54.4, opacity: 0.55, sw: 1.2 },
    { r: 42.4, opacity: 0.62, sw: 1.2 },
    { r: 30.4, opacity: 0.7, sw: 1.1 },
    { r: 18.4, opacity: 0.78, sw: 1.1 },
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
  const lines = wrapHeadline(headline, /[а-яіїєґ’']/i.test(headline) ? 16 : 20);
  const lineHeight = 88;
  const headlineBlockH = lines.length * lineHeight;
  const headlineStartY = 190 + Math.max(0, (260 - headlineBlockH) / 2);
  const headlineTspans = lines
    .map((line, i) => {
      const y = headlineStartY + i * lineHeight;
      return `<tspan x="${cx}" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  const circlesCx = W - 200;
  const circlesCy = 290;
  const ringsMarkup = marketingRingsMarkup(circlesCx, circlesCy, 0.55);
  const phoneX = Math.round((W - PHONE.outerW) / 2);
  const innerX = phoneX + PHONE.pad;
  const innerY = PHONE.y + PHONE.pad;
  const innerW = PHONE.outerW - PHONE.pad * 2;
  const innerH = PHONE.outerH - PHONE.pad * 2;
  const innerR = PHONE.radius - 8;
  const subY = headlineStartY + headlineBlockH + 52;
  const subMax = /[а-яіїєґ’']/i.test(sub) ? 28 : 34;
  const subLines = wrapHeadline(sub, subMax);
  const subTspans = subLines
    .map((line, i) => `<tspan x="${cx}" y="${subY + i * 42}">${escapeXml(line)}</tspan>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PULSATION.bgTop}"/>
      <stop offset="55%" stop-color="${PULSATION.bgMid}"/>
      <stop offset="100%" stop-color="${PULSATION.bgBottom}"/>
    </linearGradient>
    <radialGradient id="softGlow" cx="50%" cy="16%" r="58%">
      <stop offset="0%" stop-color="${PULSATION.circlesRing}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${PULSATION.bgMid}" stop-opacity="0"/>
    </radialGradient>
    <filter id="phoneShadow" x="-15%" y="-8%" width="130%" height="115%">
      <feDropShadow dx="0" dy="20" stdDeviation="28" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#softGlow)"/>
  <g opacity="0.95">${ringsMarkup}</g>
  <text text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="82" font-weight="600" fill="${PULSATION.textPrimary}">${headlineTspans}</text>
  <text text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="400" fill="${PULSATION.textSecondary}" opacity="0.98">${subTspans}</text>
  <rect x="${phoneX}" y="${PHONE.y}" width="${PHONE.outerW}" height="${PHONE.outerH}" rx="${PHONE.radius}" fill="${PULSATION.phoneFill}" stroke="${PULSATION.phoneBorder}" stroke-width="2.5" opacity="0.95" filter="url(#phoneShadow)"/>
  <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerR}" fill="${PULSATION.bgMid}"/>
</svg>`;
}

function capturePath(slide) {
  if (locale === "uk") {
    const ukNamed = join(capturesDir, "uk", slide.capture);
    if (existsSync(ukNamed)) return ukNamed;
  }
  const named = join(capturesDir, slide.capture);
  if (existsSync(named)) return named;
  throw new Error(
    `Missing ${slide.capture} in docs/app-store-screenshots/captures/${locale === "uk" ? "uk/" : ""}\n` +
      "Put raw simulator screenshots there (see README).",
  );
}

/** Covers __DEV__ HC + Reset pills in simulator captures (top-right). */
async function stripDevControls(inputPath) {
  const img = sharp(inputPath);
  const meta = await img.metadata();
  const w = meta.width;
  const h = meta.height;
  const left = Math.round(w * 0.72);
  const top = Math.round(h * 0.022);
  const patchW = w - left;
  const patchH = Math.round(h * 0.045);

  const sampleX = Math.round(w * 0.02);
  const sampleW = Math.max(8, Math.round(w * 0.04));
  const bgPatch = await sharp(inputPath)
    .extract({ left: sampleX, top, width: sampleW, height: patchH })
    .resize(patchW, patchH, { fit: "fill" })
    .png()
    .toBuffer();

  return img.composite([{ input: bgPatch, left, top }]).png().toBuffer();
}

/** Exact Connect size — app UI unchanged, letterbox if aspect differs. */
async function writeConnectPng(inputPath, outputPath) {
  const { w, h } = IPHONE;
  const stripped = await stripDevControls(inputPath);
  await sharp(stripped)
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
  const stripped = await stripDevControls(inputPath);
  const fitted = await sharp(stripped)
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
    const targetIpadDir = join(baseDir, dir);
    mkdirSync(targetIpadDir, { recursive: true });
    for (const slide of slides) {
      const base = slide.base;
      const outName = `${base}-${w}x${h}.png`;
      await sharp(join(iphoneDir, slide.output))
        .resize(w, h, { fit: "contain", background: BG })
        .png({ force: true })
        .toColorspace("srgb")
        .toFile(join(targetIpadDir, outName));
    }
  }
}

function listCaptures() {
  const dir = locale === "uk" && existsSync(join(capturesDir, "uk")) ? join(capturesDir, "uk") : capturesDir;
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".png"));
}

async function main() {
  mkdirSync(capturesDir, { recursive: true });
  mkdirSync(targetDir, { recursive: true });

  const found = listCaptures();
  if (found.length === 0) {
    console.error("No PNG files in docs/app-store-screenshots/captures/");
    console.error("Add 5 simulator screenshots named e.g. 01-onboarding-1284x2778.png");
    process.exit(1);
  }

  console.log(`Story: ${story} · locale: ${locale} · mode: ${marketing ? "marketing" : "connect"}`);

  for (const slide of slides) {
    const input = capturePath(slide);
    const output = join(targetDir, slide.output);
    if (marketing) {
      await writeMarketingPng(slide, input, output);
    } else {
      await writeConnectPng(input, output);
    }
    const meta = await sharp(output).metadata();
    console.log(`Wrote ${output} (${meta.width}×${meta.height}) — ${slide.headline}`);
  }

  /** Mirror UK marketing into marketing/uk for discoverability. */
  if (marketing && locale === "uk") {
    const mirrorDir = join(baseDir, "marketing", "uk");
    mkdirSync(mirrorDir, { recursive: true });
    for (const slide of slides) {
      await sharp(join(targetDir, slide.output)).toFile(join(mirrorDir, slide.output));
    }
    console.log(`Mirrored UK marketing → ${mirrorDir}`);
  }

  if (locale === "en" && !marketing) {
    await writeIpadFromIphone(targetDir);
    console.log("Wrote iPad variants in ipad-13-inch/ and ipad-12.9-inch/");
  }

  if (marketing) {
    console.log(
      locale === "uk"
        ? "\nUK conversion frames → docs/app-store-screenshots/uk/ (upload to Connect UK locale)."
        : "\nEN conversion frames → docs/app-store-screenshots/marketing/ (upload to Connect EN).",
    );
  } else {
    console.log("\nClean captures → docs/app-store-screenshots/connect/ (fallback without headlines).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
