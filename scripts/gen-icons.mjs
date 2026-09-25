/**
 * Draws the app icons from scratch — no third-party artwork is copied in.
 * The palette is converted from the same oklch tokens the app shell uses, so the
 * icon and the UI stay in step. Run with `node scripts/gen-icons.mjs`.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const PAPER = oklch(0.982, 0.005, 85);
const INK = oklch(0.16, 0.008, 85);
const ACCENT = oklch(0.55, 0.238, 296);
const MUTED = oklch(0.72, 0.01, 85);

function oklch(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  // Oklab's LMS cube roots go straight to linear sRGB; the XYZ matrix does not apply.
  return [
    gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

function gamma(c) {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(body));
  return Buffer.concat([head, body, tail]);
}

function encodePng(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** An .ico holding PNG entries, which every current browser accepts. */
function encodeIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const offset = 6 + 16 * entries.length;
  const directory = Buffer.alloc(16 * entries.length);
  let cursor = 0;
  entries.forEach((entry, index) => {
    const at = index * 16;
    directory[at] = entry.size === 256 ? 0 : entry.size;
    directory[at + 1] = entry.size === 256 ? 0 : entry.size;
    directory.writeUInt16LE(1, at + 4);
    directory.writeUInt16LE(32, at + 6);
    directory.writeUInt32LE(entry.data.length, at + 8);
    directory.writeUInt32LE(offset + cursor, at + 12);
    cursor += entry.data.length;
  });
  return Buffer.concat([header, directory, ...entries.map((entry) => entry.data)]);
}

/** Signed distance to a rounded rect in pixels; coverage is that distance AA'd. */
function roundedCoverage(x, y, box) {
  const [bx, by, bw, bh, r] = box;
  const dx = Math.abs(x - (bx + bw / 2)) - (bw / 2 - r);
  const dy = Math.abs(y - (by + bh / 2)) - (bh / 2 - r);
  const sdf = Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
  return Math.min(1, Math.max(0, 0.5 - sdf));
}

/**
 * Boxes are fractions of the icon, so the same description renders at 16px and
 * at 512px. `scale`/`offset` re-fit the artwork inside a maskable safe zone.
 */
const PLATE = [0, 0, 1, 1, 0.22];
const ART = [
  { box: [0.2, 0.19, 0.42, 0.11, 0.055], color: ACCENT, alpha: 1 },
  { box: [0.2, 0.4, 0.6, 0.075, 0.0375], color: INK, alpha: 0.9 },
  { box: [0.2, 0.53, 0.48, 0.075, 0.0375], color: INK, alpha: 0.55 },
  { box: [0.2, 0.66, 0.55, 0.075, 0.0375], color: MUTED, alpha: 1 },
];

function transform([x, y, w, h, r], size, scale, offset) {
  return [(x * scale + offset) * size, (y * scale + offset) * size, w * scale * size, h * scale * size, r * scale * size];
}

function paint(size, { bleed, scale = 1, offset = 0 }) {
  const ss = 4;
  const work = size * ss;
  const rgba = Buffer.alloc(work * work * 4);
  const plate = bleed
    ? [0, 0, size, size, 0]
    : transform(PLATE, size, scale, offset);
  const art = ART.map((tile) => ({
    ...tile,
    box: transform(tile.box, size, scale, offset),
  }));

  for (let y = 0; y < work; y += 1) {
    for (let x = 0; x < work; x += 1) {
      const px = (x + 0.5) / ss;
      const py = (y + 0.5) / ss;
      let alpha = roundedCoverage(px, py, plate);
      let r = PAPER[0];
      let g = PAPER[1];
      let b = PAPER[2];

      for (const tile of art) {
        const hit = roundedCoverage(px, py, tile.box) * tile.alpha;
        if (hit <= 0) continue;
        r += (tile.color[0] - r) * hit;
        g += (tile.color[1] - g) * hit;
        b += (tile.color[2] - b) * hit;
      }

      const at = (y * work + x) * 4;
      rgba[at] = Math.round(r);
      rgba[at + 1] = Math.round(g);
      rgba[at + 2] = Math.round(b);
      rgba[at + 3] = Math.round(alpha * 255);
    }
  }

  // Box-downsample, averaging colour weighted by coverage so transparent
  // supersamples cannot wash out the edges.
  const out = Buffer.alloc(size * size * 4);
  const n = ss * ss;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let sumA = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      for (let dy = 0; dy < ss; dy += 1) {
        for (let dx = 0; dx < ss; dx += 1) {
          const at = ((y * ss + dy) * work + (x * ss + dx)) * 4;
          const a = rgba[at + 3] / 255;
          sumA += a;
          sumR += rgba[at] * a;
          sumG += rgba[at + 1] * a;
          sumB += rgba[at + 2] * a;
        }
      }
      const a = sumA / n;
      const at = (y * size + x) * 4;
      out[at] = sumA > 0 ? Math.round(sumR / sumA) : 0;
      out[at + 1] = sumA > 0 ? Math.round(sumG / sumA) : 0;
      out[at + 2] = sumA > 0 ? Math.round(sumB / sumA) : 0;
      out[at + 3] = Math.round(a * 255);
    }
  }
  return out;
}

function write(path, data) {
  const full = resolve(path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, data);
  console.log('wrote', path, `${data.length} bytes`);
}

const icon = (size, options) => encodePng(size, paint(size, options));

write('public/icon-192.png', icon(192, { bleed: false }));
write('public/icon-512.png', icon(512, { bleed: false }));
// Maskable: full-bleed plate, artwork shrunk into the 80% safe zone.
write('public/icon-maskable-512.png', icon(512, { bleed: true, scale: 0.72, offset: 0.14 }));
// iOS wants a full-bleed square with no transparency.
write('public/apple-touch-icon.png', icon(180, { bleed: true }));
write('src/app/favicon.ico', encodeIco([
  { size: 48, data: icon(48, { bleed: false }) },
  { size: 32, data: icon(32, { bleed: false }) },
  { size: 16, data: icon(16, { bleed: false, scale: 1.04, offset: -0.02 }) },
]));
