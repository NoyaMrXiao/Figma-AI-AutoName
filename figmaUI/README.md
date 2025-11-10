# 导出组件所有变体 - Figma 插件

一个强大的 Figma 插件，用于批量导出组件集（Component Set）的所有变体为 SVG 格式文件。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-purple.svg)](https://www.figma.com/)

## 📋 目录

- [功能特性](#功能特性)
- [演示视频](#演示视频)
- [快速开始](#快速开始)
- [安装指南](#安装指南)
- [使用方法](#使用方法)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [技术栈](#技术栈)
- [常见问题](#常见问题)
- [许可证](#许可证)

## 🎬 演示视频

查看插件使用演示：

### MP4 格式（推荐）

<video width="100%" controls>
  <source src="docs/录屏.mp4" type="video/mp4">
  您的浏览器不支持视频播放。请<a href="docs/录屏.mp4">下载视频</a>查看。
</video>

📥 [下载 MP4 视频](docs/录屏.mp4)

### GIF 格式

![插件演示](docs/录屏.gif)

📥 [下载 GIF 动图](docs/录屏.gif)

> **提示**：如果视频文件不存在，请运行 `npm run convert-video` 从 `docs/录屏.mov` 生成 MP4 和 GIF 格式。

## ✨ 功能特性

- 🎯 **智能识别**：自动识别组件集（Component Set）及其所有变体
- 📦 **批量导出**：支持同时导出多个组件集的所有变体
- 🏷️ **智能命名**：自动为每个变体生成包含属性信息的文件名
- 📁 **自动打包**：所有 SVG 文件自动打包为 ZIP 格式下载
- 🔍 **嵌套支持**：自动识别并导出嵌套在框架、组中的组件
- 🧹 **文件清理**：自动清理文件名中的非法字符
- 💡 **实时反馈**：实时显示选中状态和组件数量
- 🎨 **友好界面**：简洁直观的用户界面

## 🚀 快速开始

### 前置要求

- Node.js 16+ 
- npm 或 yarn
- Figma 桌面应用

### 安装步骤

1. **克隆或下载项目**

```bash
cd /Applications/ode项目/figma脚本
```

2. **安装依赖**

```bash
npm install
```

3. **构建项目**

```bash
npm run build
```

4. **在 Figma 中加载插件**

   - 打开 Figma 桌面应用
   - 进入 `Plugins` > `Development` > `Import plugin from manifest...`
   - 选择项目目录中的 `manifest.json` 文件
   - 插件将出现在 `Plugins` > `Development` 菜单中

## 📖 使用方法

### 基本使用

1. **选择组件**
   - 在 Figma 画布中选中一个或多个组件集（Component Set）或组件（Component）
   - 支持选择多个组件，插件会自动识别

2. **运行插件**
   - 通过菜单：`Plugins` > `Development` > `导出组件所有变体`
   - 或使用快捷键（如果已设置）

3. **导出变体**
   - 插件会自动检测选中的组件
   - 显示找到的组件数量和状态
   - 点击"导出所有变体"按钮

4. **下载文件**
   - 所有变体导出完成后，会自动打包为 ZIP 文件
   - ZIP 文件会自动下载到默认下载目录
   - 文件名格式：`figma-components-[时间戳].zip`

### 文件命名规则

- **组件集变体**：`组件名_属性1_属性2.svg`
  - 例如：`Button_primary_large.svg`
  
- **单个组件**：`组件名.svg`
  - 例如：`Icon.svg`

- **自动清理**：文件名中的非法字符（`<>:"/\|?*`）会被替换为下划线

## 📁 项目结构

```
figma脚本/
├── manifest.json          # Figma 插件清单文件
├── package.json           # npm 依赖配置
├── tsconfig.json          # TypeScript 编译配置
├── README.md              # 项目说明文档
├── code.js                # 编译后的 JavaScript（运行 build 后生成）
│
├── src/                   # 源代码目录
│   ├── code.ts            # 主脚本代码（TypeScript）
│   ├── utils.ts           # 工具函数模块
│   └── export.ts          # 导出相关函数模块
│
├── assets/                 # 资源文件目录
│   ├── ui.html            # 插件 UI 界面
│   ├── icon.svg           # 图标源文件（SVG 格式）
│   └── icon.png           # 插件图标（128x128 PNG，用于发布）
│
├── scripts/               # 构建和工具脚本
│   ├── build.js           # 构建脚本（HTML 注入和 JSZip 内联）
│   ├── generate-icon.js   # 图标生成脚本
│   └── convert-video.js   # 视频格式转换脚本
│
├── docs/                  # 文档和演示文件
│   ├── 录屏.mov           # 原始演示视频（MOV 格式）
│   ├── 录屏.mp4           # 演示视频（MP4 格式，运行 convert-video 后生成）
│   └── 录屏.gif           # 演示动图（GIF 格式，运行 convert-video 后生成）
│
└── node_modules/          # npm 依赖包
```

## 🛠️ 开发指南

### 开发环境设置

1. **安装开发依赖**

```bash
npm install
```

2. **启动监听模式**

```bash
npm run watch
```

监听模式会自动检测文件变化并重新编译。

3. **手动编译**

```bash
npm run build
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run build` | 编译 TypeScript 并打包（包含 HTML 注入和 JSZip 内联） |
| `npm run watch` | 监听模式，自动编译（但不包含 HTML 注入） |
| `npm run icon` | 从 SVG 生成 PNG 图标（128x128） |
| `npm run convert-video` | 将录屏.mov 转换为 MP4 和 GIF 格式（需要 ffmpeg） |

### 代码结构

- **`src/code.ts`**：主入口文件，处理插件逻辑和 UI 消息
- **`src/export.ts`**：导出相关函数，处理 SVG 导出和文件收集
- **`src/utils.ts`**：工具函数，包含文件名清理、变体名称生成等
- **`assets/ui.html`**：插件 UI 界面，处理用户交互和文件下载

### 构建流程

1. **TypeScript 编译**：使用 `esbuild` 将 TypeScript 编译为 JavaScript
2. **模块打包**：将所有模块打包成单个 IIFE 格式文件
3. **HTML 注入**：将 `ui.html` 内容注入到编译后的代码中
4. **JSZip 内联**：将 JSZip 库内联到 HTML 中，避免 CDN 依赖

## 🔧 技术栈

- **语言**：TypeScript 5.0+
- **构建工具**：esbuild
- **Figma API**：Figma Plugin API 1.0.0
- **打包库**：JSZip 3.10.1（内联）
- **图像处理**：sharp（用于图标生成）

## ❓ 常见问题

### Q: 为什么导出后没有下载文件？

**A:** 请检查：
- 浏览器是否允许自动下载
- 下载目录是否有写入权限
- 浏览器控制台是否有错误信息

### Q: 如何导出特定变体？

**A:** 目前插件会导出所有变体。如果需要导出特定变体，可以在导出后手动删除不需要的文件。

### Q: 可以导出其他格式吗？

**A:** 目前仅支持 SVG 格式。如需其他格式，可以：
1. 导出 SVG 后使用其他工具转换
2. 修改代码添加其他格式支持

### Q: 为什么图标没有显示？

**A:** Figma 插件的 `manifest.json` 不支持 `icon` 属性。图标只在发布插件到 Figma 社区时使用。开发中的插件不会显示图标。

### Q: 如何处理大量组件的导出？

**A:** 插件支持批量导出，但大量组件可能需要较长时间。建议：
- 分批导出
- 确保网络连接稳定
- 关闭不必要的浏览器标签页

## 📝 更新日志

### v1.0.0 (当前版本)

- ✨ 初始版本发布
- ✅ 支持导出组件集所有变体
- ✅ 自动打包为 ZIP 文件
- ✅ 智能文件命名
- ✅ 实时状态检测
- ✅ JSZip 内联支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [JSZip](https://github.com/Stuk/jszip)
- [esbuild](https://esbuild.github.io/)

---

**提示**：使用过程中遇到问题，请查看控制台错误信息或提交 Issue。
