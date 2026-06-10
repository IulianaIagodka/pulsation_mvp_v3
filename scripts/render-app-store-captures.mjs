/**
 * Renders 1284×2778 captures matching current Pulsation UI (rings + copy).
 * Output → docs/app-store-screenshots/captures/ → npm run generate:screenshots
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const capturesDir = join(root, "docs/app-store-screenshots/captures");

const W = 1284;
const H = 2778;
const SCX = W / 2;
const SCY = 360;

const P = {
  bgTop: "#0A1222",
  bgMid: "#070D18",
  bgBottom: "#081021",
  textPrimary: "#BCC8DA",
  textSecondary: "#74839A",
  ring: "#3D5A82",
  dot: "#1C2F4A",
  link: "#74839A",
};

const COPY = {
  onboardingLine: "Pulsation exists to bring you back to yourself",
  onboardingSubtitle: "How it works:",
  onboardingSteps: [
    "It stays in the background",
    "It invites you from time to time",
    "Tap the circles to continue",
  ],
  triggerPrompt: "One action for you",
  actionText:
    "Place your feet on the ground, notice the pressure under them, take one slow breath",
  returnBody: "You are here",
  returnExplanation: "Feeling the ground under your feet helps you feel grounded.",
  keepForMe: "Save this for me",
  aboutLink: "About",
  aboutTitle: "About Pulsation",
  aboutParagraphs: [
    "Pulsation offers short, calming micro-actions when everyday digital use feels like a lot.",
    "If you allow notifications, after some time away the app may send one quiet invitation on this device. Timing adapts gently to your rhythm. No marketing messages.",
    "Pulsation does not read or analyze your other apps.",
    "This is a wellbeing app, not a medical device or substitute for professional care.",
  ],
  aboutBack: "Return",
  pathsLink: "Show my paths",
};

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLines(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ringsMarkup(cx, cy) {
  const rings = [
    { d: 136, sw: 1.15, o: 1 },
    { d: 110, sw: 1, o: 0.68 },
    { d: 86, sw: 1, o: 0.72 },
    { d: 62, sw: 1, o: 0.76 },
    { d: 38, sw: 1, o: 0.8 },
  ];
  return `${rings
    .map(
      ({ d, sw, o }) =>
        `<circle cx="${cx}" cy="${cy}" r="${d / 2 - sw / 2}" fill="none" stroke="${P.ring}" stroke-width="${sw}" opacity="${o}"/>`,
    )
    .join("")}<circle cx="${cx}" cy="${cy}" r="5" fill="${P.dot}" opacity="0.92"/>`;
}

function bgDefs() {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${P.bgTop}"/>
      <stop offset="55%" stop-color="${P.bgMid}"/>
      <stop offset="100%" stop-color="${P.bgBottom}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>`;
}

function mainText(lines, y, fontSize = 34) {
  const wrapped = Array.isArray(lines) ? lines : wrapLines(lines, 36);
  return wrapped
    .map((line, i) => {
      const yy = y + i * (fontSize + 10);
      return `<text x="${SCX}" y="${yy}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="${P.textPrimary}">${escapeXml(line)}</text>`;
    })
    .join("");
}

function mutedText(lines, y, fontSize = 28, opacity = 0.58) {
  const wrapped = Array.isArray(lines) ? lines : wrapLines(lines, 42);
  return wrapped
    .map((line, i) => {
      const yy = y + i * (fontSize + 8);
      return `<text x="${SCX}" y="${yy}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" fill="${P.textSecondary}" opacity="${opacity}">${escapeXml(line)}</text>`;
    })
    .join("");
}

function footerLink(label, y) {
  return `<text x="${SCX}" y="${y}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="26" fill="${P.link}" text-decoration="underline">${escapeXml(label)}</text>`;
}

function screenSvg(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bgDefs()}
  ${ringsMarkup(SCX, SCY)}
  ${body}
</svg>`;
}

const SCREENS = {
  "01-onboarding": () => {
    let y = 720;
    const body = [
      mainText(COPY.onboardingLine, y, 34),
      mutedText(COPY.onboardingSubtitle, (y += 100), 28, 0.58),
      ...COPY.onboardingSteps.map((step, i) => {
        const block = mutedText(step, y + 56 + i * 44, 28, 0.58);
        return block;
      }),
      footerLink(COPY.aboutLink, H - 120),
    ].join("");
    return screenSvg(body);
  },
  "02-trigger": () => {
    const body = [
      mainText(COPY.triggerPrompt, 720, 34),
      footerLink(COPY.pathsLink, H - 120),
    ].join("");
    return screenSvg(body);
  },
  "03-action": () => {
    const body = [mainText(COPY.actionText, 680, 32)].join("");
    return screenSvg(body);
  },
  "04-return": () => {
    const body = [
      mainText(COPY.returnBody, 720, 34),
      mutedText(COPY.returnExplanation, 820, 28, 0.58),
      footerLink(COPY.keepForMe, H - 120),
    ].join("");
    return screenSvg(body);
  },
  "05-about": () => {
    let y = 200;
    const parts = [
      `<text x="${SCX}" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="${P.textPrimary}">${escapeXml(COPY.aboutTitle)}</text>`,
    ];
    y += 80;
    for (const p of COPY.aboutParagraphs) {
      parts.push(mutedText(p, y, 26, 0.58));
      y += wrapLines(p, 48).length * 34 + 28;
    }
    parts.push(
      `<text x="${SCX}" y="${H - 180}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" fill="${P.textSecondary}" opacity="0.55">Version 1.0.1</text>`,
    );
    parts.push(footerLink(COPY.aboutBack, H - 120));
    return screenSvg(parts.join(""));
  },
};

async function main() {
  mkdirSync(capturesDir, { recursive: true });
  for (const base of Object.keys(SCREENS)) {
    const name = `${base}-1284x2778.png`;
    const out = join(capturesDir, name);
    const svg = SCREENS[base]();
    await sharp(Buffer.from(svg)).png().toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`Rendered ${out} (${meta.width}×${meta.height})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
