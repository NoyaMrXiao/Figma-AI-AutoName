// Express 服务器 - AI命名服务
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加请求体大小限制以支持图片

// 类型定义
interface AINamingRequest {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  nodeDescription?: string;
  context?: string | Record<string, any>;
  screenshot?: string; // base64编码的截屏图片（data:image/png;base64,... 格式）
}

interface AINamingResponse {
  suggestedName: string;
  reasoning?: string;
}

// Frame命名响应（包含多个节点的命名结果）
interface FrameNamingItem {
  nodeId: string;
  suggestedName: string;
  reasoning?: string;
}

interface FrameNamingResponse {
  success: true;
  data: {
    results: FrameNamingItem[];
    total: number;
  };
}

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  success: true;
  data: AINamingResponse;
}

interface FailResponse {
  success: false;
  error: string;
}

// 批量命名相关类型
interface BatchNamingItem extends AINamingRequest {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

interface BatchNamingRequest {
  frames: BatchNamingItem[];
}

interface BatchNamingItemResult {
  nodeId: string;
  success: boolean;
  data?: AINamingResponse;
  error?: string;
}

interface BatchNamingResponse {
  success: true;
  data: {
    results: BatchNamingItemResult[];
    total: number;
    successCount: number;
    failCount: number;
  };
}

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

// Frame结构相关类型（前端发送的格式）
interface FrameNode {
  nodeId: string;
  name?: string;
  type: string;
  componentName?: string;
  content?: string;
  url?: string;
  props?: Record<string, any>;
  styles?: Record<string, any>;
  children?: FrameNode[];
  textParts?: Array<{
    text: string;
    fontWeight?: string;
    color?: string;
    letterSpacing?: string;
  }>;
}

interface FrameData {
  frame: FrameNode;
  components?: Record<string, any>;
  designTokens?: Record<string, any>;
  assets?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface FrameNamingRequest {
  frameData: FrameData | string; // 支持对象或JSON字符串
  screenshot?: string; // base64编码的截屏图片
}

/**
 * 调用AI API生成元素名称
 */
async function generateAIName(request: AINamingRequest): Promise<AINamingResponse> {
  const { nodeId, nodeName, nodeType, nodeDescription, context, screenshot } = request;
  
  console.debug('[AI调用] 开始调用AI API生成名称');
  console.debug('[AI调用] 输入参数:', {
    nodeId,
    nodeName,
    nodeType,
    nodeDescription: nodeDescription || '无',
    hasContext: !!context,
    contextType: context ? (typeof context === 'string' ? 'string' : 'object') : 'none',
    hasScreenshot: !!screenshot,
    screenshotLength: screenshot ? screenshot.length : 0,
    hasEnvApiKey: !!process.env.OPENAI_API_KEY
  });
  
  // 使用环境变量中的 API Key
  const finalApiKey = process.env.OPENAI_API_KEY;
  
  if (!finalApiKey) {
    console.error('[AI调用] API Key 未设置');
    throw new Error('API Key 未设置，请设置 OPENAI_API_KEY 环境变量');
  }
  
  console.debug('[AI调用] 使用API Key来源: 环境变量');

  // 构建提示词
  const systemPrompt = `You are a professional UI/UX design naming assistant. Your task is to generate concise, meaningful, and design-standard-compliant names for Figma elements based on their screenshot images and related information.

Naming Conventions:
1. Use English naming with camelCase or kebab-case format
2. Names should be concise and accurately describe the element's function or appearance
3. Avoid meaningless words such as "test", "temp", "new", "untitled", "default"
4. For buttons: Use action verbs (e.g., "submitButton", "cancelButton", "deleteButton", "editButton")
5. For icons: Use descriptive nouns (e.g., "homeIcon", "userIcon", "settingsIcon", "searchIcon")
6. For frames: Use descriptive nouns indicating purpose WITHOUT adding "frame" suffix (e.g., "verification", "login", "dashboard", "settings", NOT "verificationFrame" or "loginFrame")
7. For containers: Use descriptive nouns indicating purpose (e.g., "headerContainer", "sidebarPanel", "contentWrapper", "navigationBar")
8. For groups: Use descriptive names based on content or function (e.g., "formGroup", "buttonGroup", "iconGroup")
9. For components: Use PascalCase or camelCase based on component type (e.g., "StatusBar", "UserCard", "ModalDialog")
10. Name length should be between 2-30 characters
11. Consider the element's visual appearance, style, position, and function when naming
12. Maintain consistency with existing naming patterns in the design system
13. Use semantic names that reflect the element's purpose rather than its visual appearance alone
14. DO NOT add type suffixes like "frame", "container", "group" unless they are part of the semantic meaning

Important: You must return results in JSON format as follows:
{
  "suggestedName": "suggested_name_here",
  "reasoning": "brief explanation (optional)"
}
Ensure the response is valid JSON only, without any additional text or markdown code blocks.`;

  // 格式化上下文信息
  let contextText = '';
  if (context) {
    if (typeof context === 'string') {
      contextText = context;
    } else {
      contextText = JSON.stringify(context, null, 2);
    }
  }

  // 构建用户消息内容（支持文本和图片）
  const userMessageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
  
  // 添加文本内容
  const textContent = `Please carefully observe the Figma element in the screenshot image and generate an appropriate name for it.

Element ID: ${nodeId}
Element Type: ${nodeType}
Current Name: ${nodeName || 'unnamed'}
${nodeDescription ? `Element Description: ${nodeDescription}` : ''}
${contextText ? `Context Information:\n${contextText}` : ''}

Based on the element's appearance, style, position, and function in the screenshot image, combined with the information above, generate a better name.

Return the result in JSON format. Must include "suggestedName" field, optionally include "reasoning" field. Return only the JSON object, without any additional text or markdown code blocks.`;
  
  userMessageContent.push({ type: 'text', text: textContent });
  
  // 如果有截屏，添加图片内容
  if (screenshot) {
    // 确保screenshot是完整的data URL格式
    let imageUrl = screenshot;
    if (!screenshot.startsWith('data:')) {
      // 如果不是data URL格式，假设是base64，添加前缀
      imageUrl = `data:image/png;base64,${screenshot}`;
    }
    
    userMessageContent.push({
      type: 'image_url',
      image_url: {
        url: imageUrl
      }
    });
    
    console.debug('[AI调用] 已添加截屏图片到请求');
  }

  // API请求配置 - 优先使用国内中转，如果失败可以切换到正式环境
  const apiUrl = 'https://api.302ai.cn/chat/completions';

  // 使用支持视觉的模型（gpt-4o支持视觉输入）
  const model = screenshot ? 'gpt-4o-2024-08-06' : 'gpt-4o-2024-08-06';

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessageContent
      }
    ],
    temperature: 0.7,
    max_tokens: 300
  };

  console.debug('[AI调用] 发送API请求到:', apiUrl);
  const userMessage = requestBody.messages.find(m => m.role === 'user');
  const userContent = Array.isArray(userMessage?.content) ? userMessage.content : [];
  console.debug('[AI调用] 请求配置:', {
    model: requestBody.model,
    temperature: requestBody.temperature,
    max_tokens: requestBody.max_tokens,
    hasSystemPrompt: !!requestBody.messages.find(m => m.role === 'system'),
    hasUserPrompt: !!userMessage,
    userContentTypes: userContent.map((item: any) => item.type),
    hasImage: userContent.some((item: any) => item.type === 'image_url')
  });

  const apiStartTime = Date.now();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${finalApiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const apiDuration = Date.now() - apiStartTime;
  console.debug(`[AI调用] API响应状态: ${response.status} ${response.statusText}, 耗时: ${apiDuration}ms`);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API请求失败: ${response.status}`;
    
    console.error('[AI调用] API请求失败，响应内容:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText) as { error?: { message?: string }; message?: string };
      errorMessage = (errorJson.error && errorJson.error.message) || errorJson.message || errorMessage;
      console.error('[AI调用] 解析后的错误信息:', errorMessage);
    } catch (_) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json() as {
    choices?: Array<{
      message: {
        content: string;
      };
    }>;
  };
  
  console.debug('[AI调用] API返回数据结构:', {
    hasChoices: !!data.choices,
    choicesLength: data.choices?.length || 0
  });
  
  if (!data.choices || data.choices.length === 0) {
    console.error('[AI调用] API返回数据格式不正确，缺少choices');
    throw new Error('API返回的数据格式不正确');
  }

  let content = data.choices[0].message.content.trim();
  console.debug('[AI调用] 收到AI响应内容长度:', content.length);
  console.debug('[AI调用] AI响应内容预览:', content.substring(0, 200));
  
  // 尝试提取JSON内容（处理可能的markdown代码块）
  if (content.includes('```')) {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      content = jsonMatch[1].trim();
      console.debug('[AI调用] 从markdown代码块中提取JSON');
    }
  }
  
  // 尝试提取第一个JSON对象（处理可能的额外文本）
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    content = jsonMatch[0];
    console.debug('[AI调用] 提取JSON对象');
  }
  
  // 解析JSON响应
  let namingResult: AINamingResponse;
  try {
    namingResult = JSON.parse(content) as AINamingResponse;
    console.debug('[AI调用] JSON解析成功:', {
      suggestedName: namingResult.suggestedName,
      hasReasoning: !!namingResult.reasoning
    });
  } catch (parseError) {
    console.error('[AI调用] JSON解析失败:', parseError);
    console.error('[AI调用] 原始内容:', data.choices[0].message.content);
    console.error('[AI调用] 尝试解析的内容:', content);
    throw new Error('无法解析AI返回的JSON数据');
  }

  if (!namingResult.suggestedName) {
    console.error('[AI调用] AI返回数据缺少suggestedName字段');
    throw new Error('AI返回的数据中缺少建议名称');
  }

  console.debug('[AI调用] AI命名完成，返回结果');
  return namingResult;
}

/**
 * 验证AI命名请求参数
 * @param requestBody 请求体
 * @returns 验证结果，如果通过返回null，否则返回错误信息
 */
function validateAINamingRequest(requestBody: any): { isValid: boolean; error?: string } {
  const { nodeId, nodeName, nodeType, screenshot } = requestBody;

  console.debug('[验证] 开始验证请求参数');
  console.debug('[验证] 请求参数:', {
    nodeId: nodeId || 'undefined',
    nodeName: nodeName !== undefined ? nodeName : 'undefined',
    nodeType: nodeType || 'undefined',
    nodeDescription: requestBody.nodeDescription || 'undefined',
    hasContext: !!requestBody.context,
    hasScreenshot: !!screenshot,
    screenshotLength: screenshot ? screenshot.length : 0
  });

  // 验证 nodeId（必需）
  if (!nodeId) {
    console.debug('[验证] 验证失败: nodeId 为空');
    return {
      isValid: false,
      error: '缺少必需参数: nodeId'
    };
  }

  // 验证 nodeName（允许空字符串，但不允许 undefined）
  if (nodeName === undefined) {
    console.debug('[验证] 验证失败: nodeName 为 undefined');
    return {
      isValid: false,
      error: '缺少必需参数: nodeName'
    };
  }

  // 验证 nodeType
  if (!nodeType) {
    console.debug('[验证] 验证失败: nodeType 为空');
    return {
      isValid: false,
      error: '缺少必需参数: nodeType'
    };
  }

  // 验证截屏（如果提供）
  if (screenshot) {
    // 检查是否是有效的base64格式或data URL格式
    const isValidBase64 = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(screenshot) || 
                          /^[A-Za-z0-9+/=]+$/.test(screenshot.replace(/\s/g, ''));
    if (!isValidBase64) {
      console.debug('[验证] 验证失败: screenshot 格式不正确');
      return {
        isValid: false,
        error: '截屏格式不正确，应为base64编码的图片或data URL格式'
      };
    }
  }

  console.debug('[验证] 参数验证通过');
  return { isValid: true };
}

/**
 * 处理AI命名请求
 * @param requestBody 请求体
 * @returns AI命名结果
 */
async function handleAINamingRequest(requestBody: AINamingRequest): Promise<AINamingResponse> {
  const { nodeId, nodeName, nodeType, nodeDescription, context, screenshot } = requestBody;

  console.debug('[处理] 开始处理AI命名请求');
  console.debug('[处理] 请求详情:', {
    nodeId,
    nodeName,
    nodeType,
    nodeDescription: nodeDescription || '无描述',
    hasContext: !!context,
    contextPreview: context ? (typeof context === 'string' 
      ? context.substring(0, 100) 
      : JSON.stringify(context).substring(0, 100)) : '无',
    hasScreenshot: !!screenshot,
    screenshotSize: screenshot ? `${(screenshot.length / 1024).toFixed(2)} KB` : '无',
    apiKeySource: process.env.OPENAI_API_KEY ? '环境变量' : '未设置'
  });

  try {
    const result = await generateAIName({
      nodeId,
      nodeName,
      nodeType,
      nodeDescription,
      context,
      screenshot
    });

    console.debug('[处理] AI命名成功:', {
      suggestedName: result.suggestedName,
      hasReasoning: !!result.reasoning
    });

    return result;
  } catch (error) {
    console.error('[处理] AI命名失败:', error);
    throw error;
  }
}

// 健康检查端点
app.get('/health', (req: Request, res: Response<HealthResponse>) => {
  res.json({ 
    status: 'ok', 
    message: 'AI命名服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// AI命名端点
app.post('/api/name', async (req: Request, res: Response<SuccessResponse | FailResponse>) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  console.log(`[${requestId}] ========== 收到AI命名请求 ==========`);
  console.log(`[${requestId}] 请求时间: ${new Date().toISOString()}`);
  console.log(`[${requestId}] 请求体:`, JSON.stringify(req.body, null, 2));

  try {
    const requestBody = req.body as AINamingRequest;

    // 验证参数
    const validation = validateAINamingRequest(requestBody);
    if (!validation.isValid) {
      console.warn(`[${requestId}] 参数验证失败: ${validation.error}`);
      return res.status(400).json({
        success: false,
        error: validation.error!
      } as FailResponse);
    }

    // 处理请求
    const result = await handleAINamingRequest(requestBody);

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] 请求处理成功，耗时: ${duration}ms`);
    console.log(`[${requestId}] 响应数据:`, JSON.stringify(result, null, 2));
    console.log(`[${requestId}] ========== 请求完成 ==========\n`);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'AI命名失败';
    
    console.error(`[${requestId}] 请求处理失败，耗时: ${duration}ms`);
    console.error(`[${requestId}] 错误信息:`, errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(`[${requestId}] 错误堆栈:`, error.stack);
    }
    console.error(`[${requestId}] ========== 请求失败 ==========\n`);

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * 调用AI API生成frame中所有元素的名称
 */
async function generateFrameNames(request: FrameNamingRequest): Promise<FrameNamingItem[]> {
  let frameData: FrameData;
  
  // 解析frameData（可能是字符串或对象）
  if (typeof request.frameData === 'string') {
    try {
      frameData = JSON.parse(request.frameData) as FrameData;
    } catch (error) {
      throw new Error('frameData JSON字符串解析失败');
    }
  } else {
    frameData = request.frameData;
  }
  
  if (!frameData.frame) {
    throw new Error('frameData中缺少frame字段');
  }
  
  console.debug('[Frame AI调用] 开始调用AI API生成frame名称');
  console.debug('[Frame AI调用] 输入参数:', {
    frameNodeId: frameData.frame.nodeId,
    frameName: frameData.frame.name,
    hasScreenshot: !!request.screenshot,
    screenshotLength: request.screenshot ? request.screenshot.length : 0,
    hasComponents: !!frameData.components,
    hasDesignTokens: !!frameData.designTokens,
    hasEnvApiKey: !!process.env.OPENAI_API_KEY
  });
  
  // 使用环境变量中的 API Key
  const finalApiKey = process.env.OPENAI_API_KEY;
  
  if (!finalApiKey) {
    console.error('[Frame AI调用] API Key 未设置');
    throw new Error('API Key 未设置，请设置 OPENAI_API_KEY 环境变量');
  }
  
  console.debug('[Frame AI调用] 使用API Key来源: 环境变量');

  // 构建提示词
  const systemPrompt = `You are a professional UI/UX design naming assistant. Your task is to generate concise, meaningful, and design-standard-compliant names for all elements in a Figma frame based on the screenshot image and complete frame structure information.

Naming Conventions:
1. Use English naming with camelCase or kebab-case format
2. Names should be concise and accurately describe the element's function or appearance
3. Avoid meaningless words such as "test", "temp", "new", "untitled", "default", "copy"
4. For buttons: Use action verbs (e.g., "submitButton", "cancelButton", "deleteButton", "editButton", "verifyButton")
5. For icons: Use descriptive nouns (e.g., "homeIcon", "userIcon", "settingsIcon", "searchIcon")
6. For frames: Use descriptive nouns indicating purpose WITHOUT adding "frame" suffix (e.g., "verification", "login", "dashboard", "settings", NOT "verificationFrame" or "loginFrame")
7. For containers: Use descriptive nouns indicating purpose (e.g., "headerContainer", "sidebarPanel", "contentWrapper", "navigationBar")
8. For groups: Use descriptive names based on content or function (e.g., "formGroup", "buttonGroup", "iconGroup", "inputGroup")
9. For components: Use PascalCase or camelCase based on component type (e.g., "StatusBar", "UserCard", "ModalDialog")
10. Name length should be between 2-30 characters
11. Consider the element's visual appearance, style, position, and function when naming
12. Maintain consistency with existing naming patterns in the design system
13. Use semantic names that reflect the element's purpose rather than its visual appearance alone
14. DO NOT add type suffixes like "frame", "container", "group" unless they are part of the semantic meaning
15. Only name elements of type FRAME, COMPONENT, GROUP, BUTTON, or INSTANCE
16. If an element already has an appropriate name, you may skip it (don't include it in results)
17. Analyze the hierarchical structure and relationships between elements to ensure logical naming

Important: You must return results in JSON format as follows:
{
  "results": [
    {
      "nodeId": "node_id_here",
      "suggestedName": "suggested_name_here",
      "reasoning": "brief explanation (optional)"
    }
  ]
}
Ensure the response is valid JSON only, without any additional text or markdown code blocks.`;

  // 构建frame结构摘要（简化版，避免token过多）
  const frameSummary = {
    frame: {
      nodeId: frameData.frame.nodeId,
      name: frameData.frame.name,
      type: frameData.frame.type,
      url: frameData.frame.url,
      styles: frameData.frame.styles
    },
    metadata: frameData.metadata,
    designTokens: frameData.designTokens,
    components: frameData.components ? Object.keys(frameData.components) : []
  };

  // 构建用户消息内容（支持文本和图片）
  const userMessageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
  
  // 添加文本内容
  const textContent = `Please carefully observe the Figma frame in the screenshot image and generate appropriate names for all elements that need naming within the frame.

Frame Structure Information:
${JSON.stringify(frameSummary, null, 2)}

Based on the elements' appearance, style, position, and function in the screenshot image, combined with the frame structure information above, generate better names for all elements that need naming.

Return the result in JSON format. Must include "results" array, where each element contains "nodeId" and "suggestedName" fields, optionally include "reasoning" field. Return only the JSON object, without any additional text or markdown code blocks.`;
  
  userMessageContent.push({ type: 'text', text: textContent });
  
  // 如果有截屏，添加图片内容
  if (request.screenshot) {
    // 确保screenshot是完整的data URL格式
    let imageUrl = request.screenshot;
    if (!request.screenshot.startsWith('data:')) {
      // 如果不是data URL格式，假设是base64，添加前缀
      imageUrl = `data:image/png;base64,${request.screenshot}`;
    }
    
    userMessageContent.push({
      type: 'image_url',
      image_url: {
        url: imageUrl
      }
    });
    
    console.debug('[Frame AI调用] 已添加截屏图片到请求');
  }

  // API请求配置
  const apiUrl = 'https://api.302ai.cn/chat/completions';
  const model = 'gpt-4o-2024-08-06';

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessageContent
      }
    ],
    temperature: 0.7,
    max_tokens: 2000 // 增加token限制以支持多个节点的命名结果
  };

  console.debug('[Frame AI调用] 发送API请求到:', apiUrl);
  console.debug('[Frame AI调用] 请求配置:', {
    model: requestBody.model,
    temperature: requestBody.temperature,
    max_tokens: requestBody.max_tokens,
    hasScreenshot: !!request.screenshot
  });

  const apiStartTime = Date.now();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${finalApiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const apiDuration = Date.now() - apiStartTime;
  console.debug(`[Frame AI调用] API响应状态: ${response.status} ${response.statusText}, 耗时: ${apiDuration}ms`);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API请求失败: ${response.status}`;
    
    console.error('[Frame AI调用] API请求失败，响应内容:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText) as { error?: { message?: string }; message?: string };
      errorMessage = (errorJson.error && errorJson.error.message) || errorJson.message || errorMessage;
      console.error('[Frame AI调用] 解析后的错误信息:', errorMessage);
    } catch (_) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json() as {
    choices?: Array<{
      message: {
        content: string;
      };
    }>;
  };
  
  console.debug('[Frame AI调用] API返回数据结构:', {
    hasChoices: !!data.choices,
    choicesLength: data.choices?.length || 0
  });
  
  if (!data.choices || data.choices.length === 0) {
    console.error('[Frame AI调用] API返回数据格式不正确，缺少choices');
    throw new Error('API返回的数据格式不正确');
  }

  let content = data.choices[0].message.content.trim();
  console.debug('[Frame AI调用] 收到AI响应内容长度:', content.length);
  console.debug('[Frame AI调用] AI响应内容预览:', content.substring(0, 200));
  
  // 尝试提取JSON内容（处理可能的markdown代码块）
  if (content.includes('```')) {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      content = jsonMatch[1].trim();
      console.debug('[Frame AI调用] 从markdown代码块中提取JSON');
    }
  }
  
  // 尝试提取第一个JSON对象
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    content = jsonMatch[0];
    console.debug('[Frame AI调用] 提取JSON对象');
  }
  
  // 解析JSON响应
  let namingResult: { results: FrameNamingItem[] };
  try {
    namingResult = JSON.parse(content) as { results: FrameNamingItem[] };
    console.debug('[Frame AI调用] JSON解析成功:', {
      resultsCount: namingResult.results?.length || 0
    });
  } catch (parseError) {
    console.error('[Frame AI调用] JSON解析失败:', parseError);
    console.error('[Frame AI调用] 原始内容:', data.choices[0].message.content);
    console.error('[Frame AI调用] 尝试解析的内容:', content);
    throw new Error('无法解析AI返回的JSON数据');
  }

  if (!namingResult.results || !Array.isArray(namingResult.results)) {
    console.error('[Frame AI调用] AI返回数据缺少results数组');
    throw new Error('AI返回的数据中缺少results数组');
  }

  // 验证每个结果
  for (const item of namingResult.results) {
    if (!item.nodeId || !item.suggestedName) {
      console.error('[Frame AI调用] AI返回数据中某些项缺少必需字段');
      throw new Error('AI返回的数据中某些项缺少nodeId或suggestedName字段');
    }
  }

  console.debug('[Frame AI调用] Frame命名完成，返回结果');
  return namingResult.results;
}

/**
 * 验证frame命名请求参数
 */
function validateFrameNamingRequest(requestBody: any): { isValid: boolean; error?: string } {
  console.debug('[Frame验证] 开始验证frame命名请求参数');
  
  if (!requestBody.frameData) {
    console.debug('[Frame验证] 验证失败: frameData 字段缺失');
    return {
      isValid: false,
      error: '缺少必需参数: frameData'
    };
  }
  
  // 尝试解析frameData
  let frameData: FrameData;
  try {
    if (typeof requestBody.frameData === 'string') {
      frameData = JSON.parse(requestBody.frameData) as FrameData;
    } else {
      frameData = requestBody.frameData;
    }
  } catch (error) {
    console.debug('[Frame验证] 验证失败: frameData JSON解析失败');
    return {
      isValid: false,
      error: 'frameData格式不正确，必须是有效的JSON对象或JSON字符串'
    };
  }
  
  if (!frameData.frame) {
    console.debug('[Frame验证] 验证失败: frameData中缺少frame字段');
    return {
      isValid: false,
      error: 'frameData中缺少frame字段'
    };
  }
  
  if (!frameData.frame.nodeId) {
    console.debug('[Frame验证] 验证失败: frame.nodeId缺失');
    return {
      isValid: false,
      error: 'frame.nodeId是必需的'
    };
  }
  
  // 验证截屏格式（如果提供）
  if (requestBody.screenshot) {
    const isValidBase64 = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(requestBody.screenshot) || 
                          /^[A-Za-z0-9+/=]+$/.test(requestBody.screenshot.replace(/\s/g, ''));
    if (!isValidBase64) {
      console.debug('[Frame验证] 验证失败: screenshot 格式不正确');
      return {
        isValid: false,
        error: '截屏格式不正确，应为base64编码的图片或data URL格式'
      };
    }
  }
  
  console.debug('[Frame验证] 参数验证通过');
  return { isValid: true };
}

/**
 * 验证批量命名请求参数
 */
function validateBatchNamingRequest(requestBody: any): { isValid: boolean; error?: string } {
  console.debug('[批量验证] 开始验证批量命名请求参数');
  
  if (!requestBody.frames) {
    console.debug('[批量验证] 验证失败: frames 字段缺失');
    return {
      isValid: false,
      error: '缺少必需参数: frames'
    };
  }

  if (!Array.isArray(requestBody.frames)) {
    console.debug('[批量验证] 验证失败: frames 不是数组');
    return {
      isValid: false,
      error: 'frames 必须是数组'
    };
  }

  if (requestBody.frames.length === 0) {
    console.debug('[批量验证] 验证失败: frames 数组为空');
    return {
      isValid: false,
      error: 'frames 数组不能为空'
    };
  }

  if (requestBody.frames.length > 50) {
    console.debug('[批量验证] 验证失败: frames 数量超过限制');
    return {
      isValid: false,
      error: '批量命名最多支持50个frame'
    };
  }

  // 验证每个frame的基本参数
  for (let i = 0; i < requestBody.frames.length; i++) {
    const frame = requestBody.frames[i];
    const validation = validateAINamingRequest(frame);
    if (!validation.isValid) {
      console.debug(`[批量验证] 验证失败: frames[${i}] ${validation.error}`);
      return {
        isValid: false,
        error: `frames[${i}]: ${validation.error}`
      };
    }
  }

  console.debug(`[批量验证] 参数验证通过，共 ${requestBody.frames.length} 个frame`);
  return { isValid: true };
}

/**
 * 处理批量命名请求
 */
async function handleBatchNamingRequest(requestBody: BatchNamingRequest): Promise<BatchNamingResponse['data']> {
  const { frames } = requestBody;
  const results: BatchNamingItemResult[] = [];
  
  console.debug('[批量处理] 开始处理批量命名请求');
  console.debug('[批量处理] 批量请求详情:', {
    totalFrames: frames.length,
    apiKeySource: process.env.OPENAI_API_KEY ? '环境变量' : '未设置'
  });

  // 并发处理所有frame（限制并发数为5，避免过多请求）
  const concurrencyLimit = 5;
  const chunks: BatchNamingItem[][] = [];
  
  for (let i = 0; i < frames.length; i += concurrencyLimit) {
    chunks.push(frames.slice(i, i + concurrencyLimit));
  }

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    console.debug(`[批量处理] 处理批次 ${chunkIndex + 1}/${chunks.length}，包含 ${chunk.length} 个frame`);

    const chunkPromises = chunk.map(async (frame, index) => {
      const globalIndex = chunkIndex * concurrencyLimit + index;
      const frameRequestId = `frame_${globalIndex}_${frame.nodeId}`;
      
      try {
        console.debug(`[${frameRequestId}] 开始处理frame: ${frame.nodeId}`);
        
        const result = await generateAIName({
          ...frame
        });

        console.debug(`[${frameRequestId}] frame处理成功`);
        return {
          nodeId: frame.nodeId,
          success: true,
          data: result
        } as BatchNamingItemResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'AI命名失败';
        console.error(`[${frameRequestId}] frame处理失败:`, errorMessage);
        
        return {
          nodeId: frame.nodeId,
          success: false,
          error: errorMessage
        } as BatchNamingItemResult;
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.debug('[批量处理] 批量命名完成:', {
    total: results.length,
    successCount,
    failCount
  });

  return {
    results,
    total: results.length,
    successCount,
    failCount
  };
}

// 批量命名端点
app.post('/api/name/batch', async (req: Request, res: Response<BatchNamingResponse | FailResponse>) => {
  const requestId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  console.log(`[${requestId}] ========== 收到批量命名请求 ==========`);
  console.log(`[${requestId}] 请求时间: ${new Date().toISOString()}`);
  console.log(`[${requestId}] 请求体预览:`, {
    framesCount: req.body.frames?.length || 0
  });

  try {
    const requestBody = req.body as BatchNamingRequest;

    // 验证参数
    const validation = validateBatchNamingRequest(requestBody);
    if (!validation.isValid) {
      console.warn(`[${requestId}] 参数验证失败: ${validation.error}`);
      return res.status(400).json({
        success: false,
        error: validation.error!
      } as FailResponse);
    }

    // 处理批量请求
    const result = await handleBatchNamingRequest(requestBody);

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] 批量请求处理成功，耗时: ${duration}ms`);
    console.log(`[${requestId}] 处理结果:`, {
      total: result.total,
      successCount: result.successCount,
      failCount: result.failCount
    });
    console.log(`[${requestId}] ========== 批量请求完成 ==========\n`);

    res.json({
      success: true,
      data: result
    } as BatchNamingResponse);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '批量命名失败';
    
    console.error(`[${requestId}] 批量请求处理失败，耗时: ${duration}ms`);
    console.error(`[${requestId}] 错误信息:`, errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(`[${requestId}] 错误堆栈:`, error.stack);
    }
    console.error(`[${requestId}] ========== 批量请求失败 ==========\n`);

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Frame命名端点（接收frame结构和快照）
app.post('/api/name/frame', async (req: Request, res: Response<FrameNamingResponse | FailResponse>) => {
  const requestId = `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  console.log(`[${requestId}] ========== 收到Frame命名请求 ==========`);
  console.log(`[${requestId}] 请求时间: ${new Date().toISOString()}`);
  console.log(`[${requestId}] 请求体预览:`, {
    hasFrameData: !!req.body.frameData,
    frameDataType: typeof req.body.frameData,
    hasScreenshot: !!req.body.screenshot
  });

  try {
    const requestBody = req.body as FrameNamingRequest;

    // 验证参数
    const validation = validateFrameNamingRequest(requestBody);
    if (!validation.isValid) {
      console.warn(`[${requestId}] 参数验证失败: ${validation.error}`);
      return res.status(400).json({
        success: false,
        error: validation.error!
      } as FailResponse);
    }

    // 调用AI生成frame中所有元素的名称
    const results = await generateFrameNames(requestBody);

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Frame命名请求处理成功，耗时: ${duration}ms`);
    console.log(`[${requestId}] 处理结果:`, {
      total: results.length,
      nodeIds: results.map(r => r.nodeId)
    });
    console.log(`[${requestId}] ========== Frame命名请求完成 ==========\n`);

    res.json({
      success: true,
      data: {
        results,
        total: results.length
      }
    } as FrameNamingResponse);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Frame命名失败';
    
    console.error(`[${requestId}] Frame命名请求处理失败，耗时: ${duration}ms`);
    console.error(`[${requestId}] 错误信息:`, errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(`[${requestId}] 错误堆栈:`, error.stack);
    }
    console.error(`[${requestId}] ========== Frame命名请求失败 ==========\n`);

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI命名服务已启动`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${process.env.OPENAI_API_KEY ? '已设置（环境变量）' : '未设置（需要在请求中提供）'}`);
  console.log(`\n可用端点:`);
  console.log(`  GET  /health - 健康检查`);
  console.log(`  POST /api/name - AI命名服务（单个）`);
  console.log(`  POST /api/name/batch - AI命名服务（批量）`);
  console.log(`  POST /api/name/frame - AI命名服务（Frame结构）`);
});

