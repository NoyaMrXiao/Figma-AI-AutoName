// 视频格式转换脚本
// 将 .mov 文件转换为 .mp4 和 .gif 格式

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const movPath = path.join(__dirname, '..', 'docs', '录屏.mov');
const mp4Path = path.join(__dirname, '..', 'docs', '录屏.mp4');
const gifPath = path.join(__dirname, '..', 'docs', '录屏.gif');

// 检查文件是否存在
if (!fs.existsSync(movPath)) {
  console.error('❌ 录屏.mov 文件不存在');
  process.exit(1);
}

// 检查是否安装了 ffmpeg
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ 未找到 ffmpeg，请先安装：');
  console.log('  macOS: brew install ffmpeg');
  console.log('  Windows: choco install ffmpeg 或下载 https://ffmpeg.org/download.html');
  console.log('  Linux: sudo apt-get install ffmpeg');
  process.exit(1);
}

console.log('🎬 开始转换视频格式...\n');

// 转换为 MP4
try {
  console.log('📹 正在转换为 MP4 格式...');
  execSync(
    `ffmpeg -i "${movPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart "${mp4Path}"`,
    { stdio: 'inherit' }
  );
  console.log('✅ MP4 转换完成: 录屏.mp4\n');
} catch (error) {
  console.error('❌ MP4 转换失败:', error.message);
}

// 转换为 GIF
try {
  console.log('🎨 正在转换为 GIF 格式...');
  // 先创建一个调色板
  const palettePath = path.join(__dirname, '..', 'docs', 'palette.png');
  console.log('   生成调色板...');
  execSync(
    `ffmpeg -i "${movPath}" -vf "fps=10,scale=800:-1:flags=lanczos,palettegen" "${palettePath}"`,
    { stdio: 'inherit' }
  );
  
  // 使用调色板生成 GIF
  console.log('   生成 GIF...');
  execSync(
    `ffmpeg -i "${movPath}" -i "${palettePath}" -filter_complex "fps=10,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse" "${gifPath}"`,
    { stdio: 'inherit' }
  );
  
  // 清理临时文件
  if (fs.existsSync(palettePath)) {
    fs.unlinkSync(palettePath);
  }
  
  console.log('✅ GIF 转换完成: 录屏.gif\n');
} catch (error) {
  console.error('❌ GIF 转换失败:', error.message);
}

console.log('✨ 转换完成！');
console.log('📁 生成的文件：');
if (fs.existsSync(mp4Path)) {
  const mp4Size = (fs.statSync(mp4Path).size / 1024 / 1024).toFixed(2);
  console.log(`   - 录屏.mp4 (${mp4Size} MB)`);
}
if (fs.existsSync(gifPath)) {
  const gifSize = (fs.statSync(gifPath).size / 1024 / 1024).toFixed(2);
  console.log(`   - 录屏.gif (${gifSize} MB)`);
}

