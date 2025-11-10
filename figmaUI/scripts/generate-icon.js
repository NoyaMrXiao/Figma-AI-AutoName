// Generate Figma plugin icon
// Convert SVG to 128x128 PNG

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if sharp is installed
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (error) {
  console.error('❌ Need to install sharp library to generate icon');
  console.log('Please run: npm install --save-dev sharp');
  console.log('\nOr use online tool to convert manually:');
  console.log('1. Open icon.svg file');
  console.log('2. Use online SVG to PNG converter (e.g., https://convertio.co/svg-png/)');
  console.log('3. Set to 128x128 pixels');
  console.log('4. Save as icon.png to assets directory');
  process.exit(1);
}

const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');

try {
  // Read SVG file
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Convert to PNG
  await sharp(svgBuffer)
    .resize(128, 128)
    .png()
    .toFile(pngPath);
  
  console.log('✅ Icon generated: icon.png (128x128)');
} catch (error) {
  console.error('❌ Failed to generate icon:', error.message);
  process.exit(1);
}

