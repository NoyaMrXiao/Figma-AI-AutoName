// 简单的构建脚本，将HTML注入到编译后的代码中
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
config();

// 读取HTML文件
const htmlPath = path.join(__dirname, '..', 'assets', 'ui.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// 读取 JSZip 库并内联到 HTML 中
const jszipPath = path.join(__dirname, '..', 'node_modules', 'jszip', 'dist', 'jszip.min.js');
if (fs.existsSync(jszipPath)) {
  const jszipContent = fs.readFileSync(jszipPath, 'utf-8');
  // 将 CDN 引用替换为内联脚本
  htmlContent = htmlContent.replace(
    /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jszip\/.*?"><\/script>/,
    `<script>${jszipContent}</script>`
  );
  console.log('✅ JSZip 已内联到 HTML');
} else {
  console.warn('⚠️  JSZip 文件未找到，CDN 引用将保留');
}

// 读取编译后的JS文件
const jsPath = path.join(__dirname, '..', 'code.js');
if (!fs.existsSync(jsPath)) {
  console.error('❌ code.js 不存在，请先运行 tsc 编译');
  process.exit(1);
}

let jsContent = fs.readFileSync(jsPath, 'utf-8');

// 注入环境变量 OPENAI_API_KEY（如果存在）
const openaiApiKey = process.env.OPENAI_API_KEY;
if (openaiApiKey) {
  // 在 IIFE 开始后注入环境变量
  const iifePattern = /\(\(\)\s*=>\s*\{/;
  const iifeMatch = jsContent.match(iifePattern);
  
  if (iifeMatch) {
    const insertPos = iifeMatch.index + iifeMatch[0].length;
    const before = jsContent.substring(0, insertPos);
    const after = jsContent.substring(insertPos);
    // 转义 API Key 中的特殊字符（用于双引号字符串）
    const escapedKey = openaiApiKey
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
    jsContent = before + `\n  const OPENAI_API_KEY = "${escapedKey}";` + after;
    console.log('✅ OPENAI_API_KEY 已注入到代码中');
  } else {
    // 如果没有找到 IIFE，在文件开头添加
    const escapedKey = openaiApiKey
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
    jsContent = `const OPENAI_API_KEY = "${escapedKey}";\n${jsContent}`;
    console.log('✅ OPENAI_API_KEY 已注入到代码中');
  }
} else {
  console.warn('⚠️  OPENAI_API_KEY 环境变量未设置，将使用UI输入的API Key');
}

// 将HTML内容转义（用于模板字符串）
const escapedHtml = htmlContent
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\${/g, '\\${');

// 检查是否已经定义了 __html__
const hasHtmlDef = /(const|var|let)\s+__html__\s*=\s*/.test(jsContent);

if (hasHtmlDef) {
  // 移除现有的定义（可能在文件开头）
  jsContent = jsContent.replace(
    /(const|var|let)\s+__html__\s*=\s*["'`].*?["'`];?\s*/gs,
    ''
  );
}

// 找到 IIFE 的开始位置，在 IIFE 内部添加 __html__ 定义
// 查找 "(() => {" 或 "(() => {" 或类似模式
const iifePattern = /\(\(\)\s*=>\s*\{/;
const iifeMatch = jsContent.match(iifePattern);

if (iifeMatch) {
  // 在 IIFE 开始后立即插入 __html__ 定义
  const insertPos = iifeMatch.index + iifeMatch[0].length;
  const before = jsContent.substring(0, insertPos);
  const after = jsContent.substring(insertPos);
  jsContent = before + `\n  const __html__ = \`${escapedHtml}\`;` + after;
} else {
  // 如果没有找到 IIFE，在文件开头添加
  jsContent = `const __html__ = \`${escapedHtml}\`;\n${jsContent}`;
}

// 写入文件
fs.writeFileSync(jsPath, jsContent, 'utf-8');
console.log('✅ HTML已注入到 code.js');

