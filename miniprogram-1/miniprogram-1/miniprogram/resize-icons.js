const sharp = require('sharp');
const path = require('path');

async function resizeIcons() {
  const icons = [
    { name: 'square', scale: 0.9 },
    { name: 'square_default', scale: 0.9 },
    { name: 'my', scale: 1.1 },
    { name: 'my_default', scale: 1.1 }
  ];

  for (const icon of icons) {
    const inputPath = path.join(__dirname, 'images', `${icon.name}.png`);
    const metadata = await sharp(inputPath).metadata();
    
    await sharp(inputPath)
      .resize({
        width: Math.round(metadata.width * icon.scale),
        height: Math.round(metadata.height * icon.scale)
      })
      .toFile(path.join(__dirname, 'images', `${icon.name}.tmp.png`));

    // 替换原文件
    const fs = require('fs');
    fs.renameSync(
      path.join(__dirname, 'images', `${icon.name}.tmp.png`),
      path.join(__dirname, 'images', `${icon.name}.png`)
    );
  }
}

resizeIcons().catch(console.error);