const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const svgDir = path.join(__dirname, 'images');

fs.readdir(svgDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  const svgFiles = files.filter(file => file.endsWith('.svg'));
  console.log('Found SVG files:', svgFiles);

  svgFiles.forEach(file => {
    const svgPath = path.join(svgDir, file);
    const pngPath = path.join(svgDir, file.replace('.svg', '.png'));

    sharp(svgPath)
      .resize(48, 48) // 设置合适的图标尺寸
      .png()
      .toFile(pngPath)
      .then(() => console.log(`Converted ${file} to PNG`))
      .catch(err => console.error(`Error converting ${file}:`, err));
  });
});