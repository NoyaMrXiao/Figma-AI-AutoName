# AI命名服务服务器

这是一个简单的 Express 服务器，提供 AI 命名服务的 API 接口。

## 功能特性

- 🚀 基于 Express 框架
- 📘 使用 TypeScript 编写
- 🔒 支持环境变量配置 API Key
- 📡 RESTful API 接口
- 🎯 JSON格式输出
- 🖼️ 支持视觉输入（截屏图片）
- 📦 支持批量命名（frame及子frame）
- ✅ 健康检查端点

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

### 3. 构建项目

```bash
# 编译 TypeScript
npm run build
```

### 4. 启动服务器

```bash
# 生产模式（需要先构建）
npm run build
npm start

# 开发模式（使用 tsx，无需构建）
npm run dev:tsx
```

服务器将在 `http://localhost:3000` 启动。

## API 接口

### 健康检查

```http
GET /health
```

**响应示例：**
```json
{
  "status": "ok",
  "message": "AI命名服务运行正常",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### AI命名服务

```http
POST /api/name
Content-Type: application/json
```

**请求体：**
```json
{
  "nodeId": "123:456",
  "nodeName": "Button",
  "nodeType": "COMPONENT",
  "nodeDescription": "主要按钮组件",
  "context": "这是页面头部的主要操作按钮，用于提交表单",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**参数说明：**
- `nodeId` (必需): Figma 元素的节点ID，用于标识要修改的元素
- `nodeName` (必需): 元素的当前名称
- `nodeType` (必需): 元素的类型（如 COMPONENT, FRAME, INSTANCE 等）
- `nodeDescription` (可选): 元素的描述信息
- `context` (可选): 元素的上下文信息，可以是字符串或对象，用于提供更多背景信息帮助AI生成更合适的名称
- `screenshot` (可选): 元素的截屏图片，base64编码格式。支持 `data:image/png;base64,...` 格式或纯base64字符串。AI会分析截屏图像来更好地理解元素的外观和功能

**响应示例：**
```json
{
  "success": true,
  "data": {
    "suggestedName": "primaryButton",
    "reasoning": "根据元素类型和描述，建议使用 primaryButton 作为名称"
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 批量命名服务

```http
POST /api/name/batch
Content-Type: application/json
```

**请求体：**
```json
{
  "frames": [
    {
      "nodeId": "123:456",
      "nodeName": "Frame1",
      "nodeType": "FRAME",
      "nodeDescription": "主容器",
      "context": "这是页面头部容器"
    },
    {
      "nodeId": "123:457",
      "nodeName": "Frame2",
      "nodeType": "FRAME",
      "nodeDescription": "子容器",
      "context": "这是头部内的导航容器",
      "screenshot": "data:image/png;base64,..."
    }
  ]
}
```

**参数说明：**
- `frames` (必需): frame数组，每个frame包含与单个命名相同的参数

**响应示例：**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "nodeId": "123:456",
        "success": true,
        "data": {
          "suggestedName": "headerContainer",
          "reasoning": "根据元素类型和描述，建议使用 headerContainer 作为名称"
        }
      },
      {
        "nodeId": "123:457",
        "success": true,
        "data": {
          "suggestedName": "navigationBar",
          "reasoning": "根据截屏图像和上下文，建议使用 navigationBar 作为名称"
        }
      }
    ],
    "total": 2,
    "successCount": 2,
    "failCount": 0
  }
}
```

**部分失败响应：**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "nodeId": "123:456",
        "success": true,
        "data": {
          "suggestedName": "headerContainer",
          "reasoning": "..."
        }
      },
      {
        "nodeId": "123:457",
        "success": false,
        "error": "API请求失败: 400"
      }
    ],
    "total": 2,
    "successCount": 1,
    "failCount": 1
  }
}
```

**注意事项：**
- 批量命名最多支持50个frame
- 系统会并发处理多个frame（每批5个），提高处理效率
- 即使部分frame命名失败，也会返回所有结果，通过 `success` 字段判断每个frame的处理状态

### Frame命名服务（推荐）

```http
POST /api/name/frame
Content-Type: application/json
```

**请求体：**
```json
{
  "frameData": {
    "frame": {
      "nodeId": "104:4081",
      "name": "Verification",
      "type": "FRAME",
      "url": "https://www.figma.com/design/...",
      "styles": {
        "backgroundColor": "#161719",
        "layout": "flex",
        "flexDirection": "column"
      },
      "children": [...]
    },
    "components": {
      "StatusBar": {...},
      "IconPack": {...}
    },
    "designTokens": {
      "colors": {...},
      "typography": {...}
    },
    "metadata": {
      "frameName": "Verification",
      "frameId": "104:4081"
    }
  },
  "screenshot": "data:image/png;base64,..."
}
```

**参数说明：**
- `frameData` (必需): Frame结构数据，可以是JSON对象或JSON字符串。包含完整的frame结构、组件信息、设计令牌和元数据
- `screenshot` (可选): Frame的截屏图片，base64编码格式。AI会分析截屏图像来更好地理解frame中元素的外观和功能

**响应示例：**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "nodeId": "104:4081",
        "suggestedName": "verificationFrame",
        "reasoning": "根据frame的功能和内容，建议使用verificationFrame作为名称"
      },
      {
        "nodeId": "104:4083",
        "suggestedName": "verificationContent",
        "reasoning": "这是验证页面的主要内容区域"
      },
      {
        "nodeId": "104:4103",
        "suggestedName": "verifyButton",
        "reasoning": "这是验证按钮，使用动词开头"
      }
    ],
    "total": 3
  }
}
```

**特点：**
- AI一次性分析整个frame结构，返回所有需要命名的节点
- 自动识别FRAME、COMPONENT、GROUP、BUTTON、INSTANCE等类型的元素
- 结合截屏图像和frame结构信息，生成更准确的命名建议
- 只返回需要修改的节点，已有合适名称的元素不会出现在结果中

## 使用示例

### 使用 curl

```bash
curl -X POST http://localhost:3000/api/name \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "123:456",
    "nodeName": "Button",
    "nodeType": "COMPONENT",
    "nodeDescription": "主要按钮",
    "context": "这是页面头部的主要操作按钮"
  }'
```

### 使用 JavaScript (fetch)

```javascript
// 基本请求（无截屏）
const response = await fetch('http://localhost:3000/api/name', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nodeId: '123:456',
    nodeName: 'Button',
    nodeType: 'COMPONENT',
    nodeDescription: '主要按钮',
    context: '这是页面头部的主要操作按钮，用于提交表单'
  })
});

const result = await response.json();
console.log(result);
```

### 使用截屏图片

```javascript
// 将图片转换为base64
async function getImageAsBase64(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

// 使用截屏图片的请求
const imageFile = document.getElementById('screenshotInput').files[0];
const screenshotBase64 = await getImageAsBase64(imageFile);

const response = await fetch('http://localhost:3000/api/name', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nodeId: '123:456',
    nodeName: 'Button',
    nodeType: 'COMPONENT',
    nodeDescription: '主要按钮',
    context: '这是页面头部的主要操作按钮',
    screenshot: screenshotBase64 // data:image/png;base64,... 格式
  })
});

const result = await response.json();
console.log(result);
```

### 使用对象形式的 context

```javascript
const response = await fetch('http://localhost:3000/api/name', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nodeId: '123:456',
    nodeName: 'Button',
    nodeType: 'COMPONENT',
    nodeDescription: '主要按钮',
    context: {
      parentName: 'Header',
      siblings: ['Logo', 'Navigation', 'UserMenu'],
      pageContext: '登录页面',
      usage: '提交登录表单'
    }
  })
});
```

### 使用批量命名

```javascript
// 批量命名多个frame
const response = await fetch('http://localhost:3000/api/name/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    frames: [
      {
        nodeId: '123:456',
        nodeName: 'Frame1',
        nodeType: 'FRAME',
        nodeDescription: '主容器',
        context: '这是页面头部容器'
      },
      {
        nodeId: '123:457',
        nodeName: 'Frame2',
        nodeType: 'FRAME',
        nodeDescription: '子容器',
        context: '这是头部内的导航容器'
      },
      {
        nodeId: '123:458',
        nodeName: 'Frame3',
        nodeType: 'FRAME',
        nodeDescription: '按钮容器',
        context: '这是头部内的操作按钮容器',
        screenshot: 'data:image/png;base64,...' // 可选
      }
    ]
  })
});

const result = await response.json();
console.log(`批量命名完成: ${result.data.successCount}/${result.data.total} 成功`);

// 处理结果
result.data.results.forEach(item => {
  if (item.success) {
    console.log(`${item.nodeId}: ${item.data.suggestedName}`);
  } else {
    console.error(`${item.nodeId}: ${item.error}`);
  }
});
```

### 使用Frame命名（推荐方式）

```javascript
// 发送frame结构和快照，AI一次性返回所有需要命名的节点
const frameData = {
  frame: {
    nodeId: "104:4081",
    name: "Verification",
    type: "FRAME",
    url: "https://www.figma.com/design/...",
    styles: {...},
    children: [...]
  },
  components: {...},
  designTokens: {...},
  metadata: {...}
};

// 方式1: 发送JSON对象
const response = await fetch('http://localhost:3000/api/name/frame', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    frameData: frameData,
    screenshot: 'data:image/png;base64,...' // 可选
  })
});

// 方式2: 发送JSON字符串
const response2 = await fetch('http://localhost:3000/api/name/frame', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    frameData: JSON.stringify(frameData), // 作为字符串发送
    screenshot: 'data:image/png;base64,...'
  })
});

const result = await response.json();
console.log(`共找到 ${result.data.total} 个需要命名的节点`);

// 处理结果
result.data.results.forEach(item => {
  console.log(`${item.nodeId}: ${item.suggestedName}`);
  if (item.reasoning) {
    console.log(`  理由: ${item.reasoning}`);
  }
});
```

## 环境变量

- `OPENAI_API_KEY`: OpenAI API Key（必需，必须通过环境变量设置）
- `PORT`: 服务器端口（可选，默认 3000）

## 注意事项

1. **必须设置环境变量 `OPENAI_API_KEY`**，所有API请求都使用环境变量中的API Key
2. API 返回JSON格式，AI会在提示词中被要求返回标准JSON格式
3. 当提供 `screenshot` 参数时，AI会使用视觉模型（gpt-4o）分析截屏图像，能够更准确地理解元素的外观、样式和功能
4. 截屏图片支持以下格式：
   - `data:image/png;base64,...` (推荐)
   - `data:image/jpeg;base64,...`
   - `data:image/jpg;base64,...`
   - 纯base64字符串（会自动添加 `data:image/png;base64,` 前缀）
5. 请求体大小限制为 50MB，足够支持大多数截屏图片
6. 如果AI返回的内容包含markdown代码块，系统会自动提取其中的JSON内容
7. 批量命名功能支持对多个frame进行并发处理，每批最多5个，提高处理效率
8. 批量命名最多支持50个frame，超过限制会返回错误
9. **Frame命名端点（`/api/name/frame`）是推荐的方式**，它可以将整个frame结构和快照一次性发送给AI，AI会分析并返回所有需要命名的节点，效率更高
10. Frame命名端点会自动识别需要命名的元素类型（FRAME、COMPONENT、GROUP、BUTTON、INSTANCE），只返回需要修改的节点

