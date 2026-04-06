import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const svgPath = path.join(__dirname, 'public', 'icon.svg');

async function generateIcons() {
  const svgBuffer = await sharp(svgPath).toBuffer();

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-512.png'));

  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.ico'));

  console.log('Icons generated successfully');
}

generateIcons().catch((error) => {
  console.error(error);
  process.exit(1);
});