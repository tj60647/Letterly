const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'src', 'app', 'icon.svg');
const icoPath = path.join(__dirname, 'src', 'app', 'favicon.ico');

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
