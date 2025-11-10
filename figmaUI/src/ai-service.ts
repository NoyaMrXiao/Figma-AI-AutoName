// AI服务模块 - 通过服务器调用AI API进行自动命名

interface ElementContext {
  // 基本信息
  nodeName: string;
  nodeType: string;
  nodeDescription?: string;
  
  // 内容信息
  content?: string; // 节点的文本内容或其他内容
  
  // 层级信息
  parentName?: string;
  parentType?: string;
  siblingNames?: string[]; // 兄弟节点的名称列表
  
  // 元素属性
  variantProperties?: Record<string, string>; // 如果是组件实例，变体属性
  isComponent?: boolean;
  isInstance?: boolean;
  
  // 布局信息
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  
  // 子元素信息
  childrenCount?: number;
  childrenTypes?: string[]; // 子元素的类型列表
  childrenContent?: string[]; // 子元素的文本内容列表
}

interface AINamingRequest {
  serverUrl: string;
  nodeId: string;
  elementContext: ElementContext;
  screenshot?: string; // base64编码的截屏图片
  apiKey?: string; // 可选，如果服务器已配置API Key则不需要
}

interface AINamingResponse {
  suggestedName: string;
  reasoning?: string;
}

interface ServerResponse {
  success: boolean;
  data?: AINamingResponse;
  error?: string;
}

interface BatchNamingItem {
  nodeId: string;
  elementContext: ElementContext;
  screenshot?: string;
}

interface BatchNamingRequest {
  serverUrl: string;
  items: BatchNamingItem[];
  apiKey?: string;
}

interface BatchNamingResponse {
  success: boolean;
  data?: {
    results: Array<{
      nodeId: string;
      suggestedName: string;
      reasoning?: string;
    }>;
    total: number;
  };
  error?: string;
}

/**
 * 通过服务器调用AI API生成元素名称
 */
export async function generateAIName(request: AINamingRequest): Promise<AINamingResponse> {
  const { serverUrl, nodeId, elementContext, screenshot, apiKey } = request;
  
  if (!serverUrl) {
    throw new Error('服务器地址未设置');
  }

  // 构建请求URL
  const apiUrl = `${serverUrl.replace(/\/$/, '')}/api/name`;
  
  // 将 elementContext 转换为符合 API 规范的格式
  // context 可以是对象（包含完整上下文信息）或字符串（JSON 文本）
  const context: any = {
    // 层级信息
    parentName: elementContext.parentName,
    parentType: elementContext.parentType,
    siblings: elementContext.siblingNames,
    
    // 元素属性
    variantProperties: elementContext.variantProperties,
    isComponent: elementContext.isComponent,
    isInstance: elementContext.isInstance,
    
    // 布局信息
    width: elementContext.width,
    height: elementContext.height,
    x: elementContext.x,
    y: elementContext.y,
    
    // 子元素信息
    childrenCount: elementContext.childrenCount,
    childrenTypes: elementContext.childrenTypes,
    childrenContent: elementContext.childrenContent,
    
    // 内容信息
    content: elementContext.content
  };
  
  // 移除 undefined 值
  Object.keys(context).forEach(key => {
    if (context[key] === undefined) {
      delete context[key];
    }
  });
  
  // 构建请求体（符合 API 规范）
  const requestBody: {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    nodeDescription?: string;
    context?: string | object;
    screenshot?: string;
    apiKey?: string;
  } = {
    nodeId: nodeId,
    nodeName: elementContext.nodeName,
    nodeType: elementContext.nodeType
  };

  if (elementContext.nodeDescription) {
    requestBody.nodeDescription = elementContext.nodeDescription;
  }

  // context 作为对象发送（包含完整的上下文信息）
  if (Object.keys(context).length > 0) {
    requestBody.context = context;
  }

  // 添加截屏图片（如果提供）
  if (screenshot) {
    requestBody.screenshot = screenshot;
  }

  if (apiKey) {
    requestBody.apiKey = apiKey;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorMessage = `服务器请求失败: ${response.status}`;
      
      try {
        const errorText = await response.text();
        const errorJson = JSON.parse(errorText) as ServerResponse;
        errorMessage = errorJson.error || errorMessage;
      } catch (_) {
        // 如果无法解析错误响应，使用默认错误消息
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json() as ServerResponse;
    
    if (!data.success || !data.data) {
      throw new Error(data.error || '服务器返回的数据格式不正确');
    }

    if (!data.data.suggestedName) {
      throw new Error('服务器返回的数据中缺少建议名称');
    }

    return data.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 处理网络错误
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      throw new Error('无法连接到服务器，请检查服务器地址是否正确');
    }
    
    throw new Error(`AI命名失败: ${errorMessage}`);
  }
}

/**
 * 批量通过服务器调用AI API生成元素名称
 */
export async function generateBatchAIName(request: BatchNamingRequest): Promise<Array<{
  nodeId: string;
  suggestedName: string;
  reasoning?: string;
}>> {
  const { serverUrl, items, apiKey } = request;
  
  if (!serverUrl) {
    throw new Error('服务器地址未设置');
  }

  if (!items || items.length === 0) {
    throw new Error('批量命名列表为空');
  }

  // 构建请求URL
  const apiUrl = `${serverUrl.replace(/\/$/, '')}/api/name/frame`;
  
  // 根据文档，/api/name/frame 接口接收一个frame的frameData和screenshot
  // AI会一次性分析整个frame结构，返回所有需要命名的节点（包括子frame）
  // 所以这里只处理第一个item（主frame）

  const { nodeId, elementContext, screenshot } = items[0];
  
  // 构建frameData结构
  // frameData可以是JSON对象或JSON字符串
  const frameData: any = {
    frame: {
      nodeId: nodeId,
      name: elementContext.nodeName,
      type: elementContext.nodeType,
      styles: {
        width: elementContext.width ? `${elementContext.width}px` : undefined,
        height: elementContext.height ? `${elementContext.height}px` : undefined,
        backgroundColor: undefined, // 可以后续扩展
        layout: elementContext.nodeType === 'FRAME' ? 'flex' : undefined,
      }
    },
    components: {}, // 可以后续扩展
    designTokens: {}, // 可以后续扩展
    metadata: {
      frameName: elementContext.nodeName,
      frameId: nodeId,
      extractedAt: new Date().getFullYear().toString()
    }
  };

  // 移除undefined值
  Object.keys(frameData.frame.styles).forEach(key => {
    if (frameData.frame.styles[key] === undefined) {
      delete frameData.frame.styles[key];
    }
  });

  // 构建请求体
  const requestBody: any = {
    frameData: frameData, // 作为JSON对象发送（也可以作为JSON字符串）
    screenshot: screenshot || ''
  };

  if (apiKey) {
    requestBody.apiKey = apiKey;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let errorMessage = `服务器请求失败: ${response.status}`;
    
    try {
      const errorText = await response.text();
      const errorJson = JSON.parse(errorText) as BatchNamingResponse;
      errorMessage = errorJson.error || errorMessage;
    } catch (_) {
      // 如果无法解析错误响应，使用默认错误消息
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json() as BatchNamingResponse;
  
  if (!data.success || !data.data) {
    throw new Error(data.error || '服务器返回的数据格式不正确');
  }

  if (!Array.isArray(data.data.results)) {
    throw new Error('服务器返回的数据格式不正确，期望results数组');
  }

  // 验证返回的数据
  for (const item of data.data.results) {
    if (!item.nodeId || !item.suggestedName) {
      throw new Error('服务器返回的数据中缺少必要字段');
    }
  }

  // 返回所有结果（包括子frame的命名结果）
  return data.data.results;
}
