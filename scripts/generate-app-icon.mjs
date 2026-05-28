/**
 * Renders the same concentric-ring spiral as SpiralFocus (136px) at 1024×1024.
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = join(root, "assets");

const size = 1024;
const base = 136;
/** Outer ring uses this fraction of canvas width (inset for home-screen / adaptive masks). */
const artScale = 0.76;
const s = (size * artScale) / base;
const cx = size / 2;
const cy = size / 2;
const bg = "#0D121E";
const ringColor = "#4D6C97";
const dotColor = "#223451";

const rings = [
  { diameter: 136, opacity: 1, stroke: 1.15 },
  { diameter: 110, opacity: 0.74, stroke: 1.15 },
  { diameter: 86, opacity: 0.78, stroke: 1.15 },
  { diameter: 62, opacity: 0.82, stroke: 1.15 },
  { diameter: 38, opacity: 0.86, stroke: 1.15 },
];

const ringMarkup = rings
  .map(({ diameter, opacity, stroke }) => {
    const r = (diameter * s) / 2;
    const sw = stroke * s;
    return `<circle cx="${cx}" cy="${cy}" r="${r - sw / 2}" fill="none" stroke="${ringColor}" stroke-width="${sw}" opacity="${opacity}"/>`;
  })
  .join("\n");

const dotR = 5 * s;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${bg}"/>
  ${ringMarkup}
  <circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${dotColor}" opacity="0.95"/>
</svg>`;

writeFileSync(join(assetsDir, "icon.svg"), svg);

const png = await sharp(Buffer.from(svg)).png().toBuffer();

for (const name of ["icon.png", "adaptive-icon.png", "splash-icon.png"]) {
  await sharp(png).toFile(join(assetsDir, name));
}

const favicon = await sharp(png).resize(48, 48).png().toBuffer();
await sharp(favicon).toFile(join(assetsDir, "favicon.png"));

console.log("Generated:", join(assetsDir, "icon.png"), "(1024×1024, matches SpiralFocus)");
