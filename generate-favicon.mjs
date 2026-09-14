/**
 * @file generate-favicon.mjs
 * @description Generates src/app/favicon.ico from src/app/icon.svg. Run with: node generate-favicon.mjs
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(here, 'src', 'app', 'icon.svg');
const icoPath = path.join(here, 'src', 'app', 'favicon.ico');

sharp(svgPath)
  .resize(256, 256)
  .toFormat('png')
  .toBuffer()
  .then(buffer => {
    // For ICO format, we'll just save as PNG with .ico extension
    // Modern browsers support this
    fs.writeFileSync(icoPath, buffer);
    console.log('✅ favicon.ico generated successfully at 256x256!');
  })
  .catch(err => {
    console.error('Error generating favicon:', err);
    process.exit(1);
  });
