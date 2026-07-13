const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPNG(width, height) {
  const crc32Table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crc32Table[n] = c;
  }
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = crc32Table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function chunk(type, data) {
    const t = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  }

  // RGBA pixel data
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    rawData[y * (rowSize + 1)] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const px = (y * (rowSize + 1)) + 1 + x * 4;
      // Rounded rectangle with gradient background
      const cornerR = Math.floor(width * 0.22);
      const inCorner = (cx, cy) => {
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        return dx > cornerR && dy > cornerR &&
          Math.sqrt((dx - cornerR) ** 2 + (dy - cornerR) ** 2) > cornerR;
      };
      const margin = 2;
      const inRoundRect = x >= margin && x < width - margin && y >= margin && y < height - margin;
      const inCorners =
        (x < cornerR + margin && y < cornerR + margin && inCorner(cornerR + margin, cornerR + margin)) ||
        (x >= width - cornerR - margin && y < cornerR + margin && inCorner(width - cornerR - margin - 1, cornerR + margin)) ||
        (x < cornerR + margin && y >= height - cornerR - margin && inCorner(cornerR + margin, height - cornerR - margin - 1)) ||
        (x >= width - cornerR - margin && y >= height - cornerR - margin && inCorner(width - cornerR - margin - 1, height - cornerR - margin - 1));

      if (inRoundRect && !inCorners) {
        // Green gradient
        const t = (x + y) / (width + height);
        const r = Math.floor(15 * (1 - t) + 8 * t);
        const g = Math.floor(162 * (1 - t) + 106 * t);
        const b = Math.floor(75 * (1 - t) + 50 * t);
        rawData[px] = r;
        rawData[px + 1] = g;
        rawData[px + 2] = b;
        rawData[px + 3] = 255;

        // White "P" letter in center
        const cx = width / 2, cy = height / 2;
        const normX = (x - cx) / (width * 0.22);
        const normY = (y - cy) / (height * 0.35);
        const inP = (
          (Math.abs(normX + 0.35) < 0.08 && normY > -0.8 && normY < 0.8) ||
          (normY > -0.8 && normY < -0.55 && normX > -0.35 && normX < 0.5) ||
          (normY > -0.15 && normY < 0.1 && normX > -0.35 && normX < 0.5) ||
          (normX > 0.35 && normX < 0.6 && normY > -0.8 && normY < -0.15 && normY > -0.8) ||
          (Math.abs(normY + 0.8) < 0.08 && normX > -0.35 && normX < 0.45) ||
          (Math.abs(normY - 0.1) < 0.08 && normX > -0.35 && normX < 0.35)
        );
        if (inP) {
          rawData[px] = 255;
          rawData[px + 1] = 255;
          rawData[px + 2] = 255;
          rawData[px + 3] = 255;
        }
      } else {
        rawData[px + 3] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  header[10] = 0; header[11] = 0; header[12] = 0;

  const ihdr = chunk("IHDR", header);
  const idat = chunk("IDAT", deflated);
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    ihdr, idat, iend
  ]);
}

const out = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(out, { recursive: true });

[192, 512].forEach((s) => {
  const buf = createPNG(s, s);
  const p = path.join(out, `icon-${s}.png`);
  fs.writeFileSync(p, buf);
  console.log(`${p} (${buf.length} bytes)`);
});

console.log("Done!");
