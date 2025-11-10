"use strict";
(() => {
  const __html__ = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Auto Naming</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 16px;
      margin: 0;
      background: #ffffff;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status {
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
    }
    .status.info {
      background: #e3f2fd;
      color: #1976d2;
      border: 1px solid #bbdefb;
    }
    .status.warning {
      background: #fff3e0;
      color: #f57c00;
      border: 1px solid #ffe0b2;
    }
    .status.success {
      background: #e8f5e9;
      color: #388e3c;
      border: 1px solid #c8e6c9;
    }
    .status.error {
      background: #ffebee;
      color: #d32f2f;
      border: 1px solid #ffcdd2;
    }
    .status.processing {
      background: #f5f5f5;
      color: #666;
      border: 1px solid #e0e0e0;
    }
    .selected-element {
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }
    .element-preview {
      margin-top: 12px;
      padding: 8px;
      background: #fff;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      max-height: 200px;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .element-preview img {
      max-width: 100%;
      max-height: 180px;
      display: block;
      border-radius: 2px;
    }
    .element-preview-placeholder {
      color: #999;
      font-size: 11px;
      text-align: center;
      padding: 20px;
    }
    .element-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .element-name {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      word-break: break-word;
    }
    .element-type {
      font-size: 11px;
      color: #666;
      text-transform: capitalize;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 11px;
      font-weight: 500;
      color: #333;
    }
    input[type="text"],
    input[type="password"] {
      padding: 8px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 12px;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus,
    input[type="password"]:focus {
      outline: none;
      border-color: #18a0fb;
    }
    .button-group {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    button {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .primary {
      background: #18a0fb;
      color: white;
    }
    .primary:hover:not(:disabled) {
      background: #1592e6;
    }
    .secondary {
      background: #f0f0f0;
      color: #333;
    }
    .secondary:hover:not(:disabled) {
      background: #e0e0e0;
    }
    .api-key-toggle {
      font-size: 11px;
      color: #18a0fb;
      cursor: pointer;
      text-decoration: underline;
      margin-top: 4px;
    }
    .api-key-toggle:hover {
      color: #1592e6;
    }
    .hidden {
      display: none;
    }
    .suggested-name {
      margin-top: 8px;
      padding: 8px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 12px;
      color: #333;
    }
    .suggested-name-label {
      font-size: 11px;
      color: #666;
      margin-bottom: 4px;
    }
    .suggested-name-value {
      font-weight: 500;
      word-break: break-word;
    }
    .button-description {
      font-size: 10px;
      color: #999;
      margin-top: 4px;
      line-height: 1.4;
    }
    .button-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="section">
      <div class="section-title">Selected Element</div>
      <div class="selected-element" id="selectedElement">
        <div class="status warning">No element selected. Select an element in Figma to get started.</div>
      </div>
      <div class="element-preview hidden" id="elementPreview">
        <div class="element-preview-placeholder" id="previewPlaceholder">Loading preview...</div>
      </div>
    </div>

    <div class="section">
      <div class="status info hidden" id="statusMessage"></div>
      <div class="suggested-name hidden" id="suggestedName">
        <div class="suggested-name-label" id="suggestedNameLabel">Suggested Name</div>
        <div class="suggested-name-value" id="suggestedNameValue"></div>
      </div>
    </div>

    <div class="button-group">
      <div class="button-wrapper">
        <button class="primary" id="aiNameBtn" disabled>AI Auto Name</button>
        <div class="button-description">Generate and automatically apply an AI-powered name for the selected element</div>
      </div>
      <button class="secondary hidden" id="applyNameBtn" disabled>Apply Name</button>
    </div>

    <div class="button-group">
      <div class="button-wrapper">
        <button class="primary" id="batchNameBtn" disabled>Batch Name Frames</button>
        <div class="button-description">Generate and apply AI names for the selected frame and all its child frames at once</div>
      </div>
    </div>

    <div class="button-group">
      <button class="secondary" id="cancelBtn">Close</button>
    </div>
  </div>

  <script>
    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', () => {
      const selectedElementEl = document.getElementById('selectedElement');
      const elementPreviewEl = document.getElementById('elementPreview');
      const statusMessageEl = document.getElementById('statusMessage');
      const suggestedNameEl = document.getElementById('suggestedName');
      const suggestedNameValueEl = document.getElementById('suggestedNameValue');
      const aiNameBtn = document.getElementById('aiNameBtn');
      const applyNameBtn = document.getElementById('applyNameBtn');
      const batchNameBtn = document.getElementById('batchNameBtn');
      const cancelBtn = document.getElementById('cancelBtn');

      if (!selectedElementEl || !statusMessageEl || !aiNameBtn) {
        console.error('UI elements not found');
        return;
      }

      let currentSelectedNode = null;
      let suggestedName = '';

      // Default server URL
      const defaultServerUrl = 'https://weapp-admin.ode.asia';

      // Update selected element display
      function updateSelectedElement(node, previewImage) {
        currentSelectedNode = node;
        
        if (!node) {
          selectedElementEl.innerHTML = '<div class="status warning">No element selected. Select an element in Figma to get started.</div>';
          elementPreviewEl.classList.add('hidden');
          aiNameBtn.disabled = true;
          applyNameBtn.disabled = true;
          batchNameBtn.disabled = true;
          return;
        }

        const elementInfo = \`
          <div class="element-info">
            <div class="element-name">\${escapeHtml(node.name || 'Unnamed')}</div>
            <div class="element-type">\${escapeHtml(node.type || 'Unknown type')}</div>
          </div>
        \`;
        selectedElementEl.innerHTML = elementInfo;
        
        // Update preview image display
        if (previewImage) {
          elementPreviewEl.innerHTML = \`<img src="\${previewImage}" alt="Element preview" />\`;
          elementPreviewEl.classList.remove('hidden');
        } else {
          elementPreviewEl.classList.add('hidden');
        }
        
        updateButtonState();
        applyNameBtn.disabled = true;
        suggestedNameEl.classList.add('hidden');
      }

      // Show status message
      function showStatus(message, type = 'info') {
        statusMessageEl.textContent = message;
        statusMessageEl.className = \`status \${type}\`;
        statusMessageEl.classList.remove('hidden');
      }

      // Hide status message
      function hideStatus() {
        statusMessageEl.classList.add('hidden');
      }

      // Escape HTML
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      // Listen for messages from main script
      window.addEventListener('message', (event) => {
        try {
          const msg = event.data && event.data.pluginMessage;
          
          if (!msg) {
            return;
          }
          
          if (msg.type === 'selection-changed') {
            console.log('Selection changed:', msg.node);
            updateSelectedElement(msg.node, msg.previewImage);
            hideStatus();
            suggestedNameEl.classList.add('hidden');
          } else if (msg.type === 'ai-naming-progress') {
            showStatus(msg.message, 'processing');
            aiNameBtn.disabled = true;
          } else if (msg.type === 'ai-naming-success') {
            suggestedName = msg.suggestedName;
            suggestedNameValueEl.textContent = suggestedName;
            suggestedNameEl.classList.remove('hidden');
            showStatus('Name generated! Applying automatically...', 'processing');
            aiNameBtn.disabled = true;
            applyNameBtn.disabled = true;
            
            // Auto apply name
            if (currentSelectedNode && suggestedName) {
              parent.postMessage({ 
                pluginMessage: { 
                  type: 'apply-name',
                  nodeId: currentSelectedNode.id,
                  newName: suggestedName
                } 
              }, '*');
            }
          } else if (msg.type === 'ai-naming-error') {
            showStatus(\`Naming failed: \${msg.error}\`, 'error');
            aiNameBtn.disabled = false;
            applyNameBtn.disabled = true;
          } else if (msg.type === 'name-applied') {
            showStatus('Name applied successfully', 'success');
            aiNameBtn.disabled = false;
            applyNameBtn.disabled = true;
            // Keep suggested name displayed so user knows what was applied
          } else if (msg.type === 'batch-naming-started') {
            const plural = msg.totalCount > 1 ? 's' : '';
            showStatus(\`Starting batch naming for \${msg.totalCount} frame\${plural}...\`, 'processing');
            aiNameBtn.disabled = true;
            batchNameBtn.disabled = true;
            suggestedNameEl.classList.add('hidden');
          } else if (msg.type === 'batch-naming-progress') {
            showStatus(\`\${msg.message}\`, 'processing');
          } else if (msg.type === 'batch-naming-completed') {
            const successMsg = \`Batch naming complete: \${msg.successCount} succeeded, \${msg.failCount} failed\`;
            showStatus(successMsg, msg.failCount === 0 ? 'success' : 'warning');
            aiNameBtn.disabled = false;
            batchNameBtn.disabled = false;
          } else if (msg.type === 'batch-naming-error') {
            showStatus(\`Batch naming failed: \${msg.error}\`, 'error');
            aiNameBtn.disabled = false;
            batchNameBtn.disabled = false;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      // Trigger AI naming request
      function triggerAINaming() {
        if (!currentSelectedNode) {
          showStatus('Please select an element first', 'warning');
          return;
        }

        // If button is disabled (processing), don't execute
        if (aiNameBtn.disabled) {
          return;
        }

        showStatus('Generating name with AI...', 'processing');
        aiNameBtn.disabled = true;
        applyNameBtn.disabled = true;
        
        parent.postMessage({ 
          pluginMessage: { 
            type: 'ai-name-request',
            serverUrl: defaultServerUrl,
            apiKey: undefined,
            nodeId: currentSelectedNode.id
          } 
        }, '*');
      }

      // AI naming button click event
      aiNameBtn.addEventListener('click', triggerAINaming);

      // Batch naming button click event
      batchNameBtn.addEventListener('click', () => {
        if (!currentSelectedNode) {
          showStatus('Please select a frame or container first', 'warning');
          return;
        }

        // If button is disabled (processing), don't execute
        if (batchNameBtn.disabled) {
          return;
        }

        showStatus('Preparing batch naming...', 'processing');
        aiNameBtn.disabled = true;
        batchNameBtn.disabled = true;
        
        parent.postMessage({ 
          pluginMessage: { 
            type: 'batch-name-request',
            serverUrl: defaultServerUrl,
            apiKey: undefined,
            nodeId: currentSelectedNode.id
          } 
        }, '*');
      });

      // Apply name button click event
      applyNameBtn.addEventListener('click', () => {
        if (!suggestedName || !currentSelectedNode) {
          return;
        }

        parent.postMessage({ 
          pluginMessage: { 
            type: 'apply-name',
            nodeId: currentSelectedNode.id,
            newName: suggestedName
          } 
        }, '*');
      });

      // Cancel button click event
      cancelBtn.addEventListener('click', () => {
        parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
      });

      // Update button state
      function updateButtonState() {
        const hasSelection = currentSelectedNode !== null;
        aiNameBtn.disabled = !hasSelection;
        
        // Batch naming button: only enable when selected is FRAME or container node
        const isFrameOrContainer = hasSelection && (
          currentSelectedNode.type === 'FRAME' || 
          currentSelectedNode.type === 'GROUP' ||
          currentSelectedNode.type === 'COMPONENT' ||
          currentSelectedNode.type === 'INSTANCE'
        );
        batchNameBtn.disabled = !isFrameOrContainer;
      }

      // Request initial selection state (delay to ensure UI is ready)
      setTimeout(() => {
        console.log('Requesting initial selection state');
        parent.postMessage({ pluginMessage: { type: 'check-selection' } }, '*');
      }, 200);

      // Listen for keyboard shortcut Command+Shift+N (Mac) or Ctrl+Shift+N (Windows/Linux)
      document.addEventListener('keydown', (event) => {
        // Detect Command (Mac) or Ctrl (Windows/Linux) + Shift + N
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifierKey = isMac ? event.metaKey : event.ctrlKey;
        
        if (modifierKey && event.shiftKey && event.key === 'n') {
          event.preventDefault();
          event.stopPropagation();
          triggerAINaming();
        }
      });
    });
  </script>
</body>
</html>
`;
  // src/ai-service.ts
  async function generateAIName(request) {
    const { serverUrl, nodeId, elementContext, screenshot, apiKey } = request;
    if (!serverUrl) {
      throw new Error("\u670D\u52A1\u5668\u5730\u5740\u672A\u8BBE\u7F6E");
    }
    const apiUrl = `${serverUrl.replace(/\/$/, "")}/api/name`;
    const context = {
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
    Object.keys(context).forEach((key) => {
      if (context[key] === void 0) {
        delete context[key];
      }
    });
    const requestBody = {
      nodeId,
      nodeName: elementContext.nodeName,
      nodeType: elementContext.nodeType
    };
    if (elementContext.nodeDescription) {
      requestBody.nodeDescription = elementContext.nodeDescription;
    }
    if (Object.keys(context).length > 0) {
      requestBody.context = context;
    }
    if (screenshot) {
      requestBody.screenshot = screenshot;
    }
    if (apiKey) {
      requestBody.apiKey = apiKey;
    }
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        let errorMessage = `\u670D\u52A1\u5668\u8BF7\u6C42\u5931\u8D25: ${response.status}`;
        try {
          const errorText = await response.text();
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (_) {
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || "\u670D\u52A1\u5668\u8FD4\u56DE\u7684\u6570\u636E\u683C\u5F0F\u4E0D\u6B63\u786E");
      }
      if (!data.data.suggestedName) {
        throw new Error("\u670D\u52A1\u5668\u8FD4\u56DE\u7684\u6570\u636E\u4E2D\u7F3A\u5C11\u5EFA\u8BAE\u540D\u79F0");
      }
      return data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
        throw new Error("\u65E0\u6CD5\u8FDE\u63A5\u5230\u670D\u52A1\u5668\uFF0C\u8BF7\u68C0\u67E5\u670D\u52A1\u5668\u5730\u5740\u662F\u5426\u6B63\u786E");
      }
      throw new Error(`AI\u547D\u540D\u5931\u8D25: ${errorMessage}`);
    }
  }
  async function generateBatchAIName(request) {
    const { serverUrl, items, apiKey } = request;
    if (!serverUrl) {
      throw new Error("\u670D\u52A1\u5668\u5730\u5740\u672A\u8BBE\u7F6E");
    }
    if (!items || items.length === 0) {
      throw new Error("\u6279\u91CF\u547D\u540D\u5217\u8868\u4E3A\u7A7A");
    }
    const apiUrl = `${serverUrl.replace(/\/$/, "")}/api/name/frame`;
    const { nodeId, elementContext, screenshot } = items[0];
    const frameData = {
      frame: {
        nodeId,
        name: elementContext.nodeName,
        type: elementContext.nodeType,
        styles: {
          width: elementContext.width ? `${elementContext.width}px` : void 0,
          height: elementContext.height ? `${elementContext.height}px` : void 0,
          backgroundColor: void 0,
          // 可以后续扩展
          layout: elementContext.nodeType === "FRAME" ? "flex" : void 0
        }
      },
      components: {},
      // 可以后续扩展
      designTokens: {},
      // 可以后续扩展
      metadata: {
        frameName: elementContext.nodeName,
        frameId: nodeId,
        extractedAt: (/* @__PURE__ */ new Date()).getFullYear().toString()
      }
    };
    Object.keys(frameData.frame.styles).forEach((key) => {
      if (frameData.frame.styles[key] === void 0) {
        delete frameData.frame.styles[key];
      }
    });
    const requestBody = {
      frameData,
      // 作为JSON对象发送（也可以作为JSON字符串）
      screenshot: screenshot || ""
    };
    if (apiKey) {
      requestBody.apiKey = apiKey;
    }
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      let errorMessage = `\u670D\u52A1\u5668\u8BF7\u6C42\u5931\u8D25: ${response.status}`;
      try {
        const errorText = await response.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (_) {
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "\u670D\u52A1\u5668\u8FD4\u56DE\u7684\u6570\u636E\u683C\u5F0F\u4E0D\u6B63\u786E");
    }
    if (!Array.isArray(data.data.results)) {
      throw new Error("\u670D\u52A1\u5668\u8FD4\u56DE\u7684\u6570\u636E\u683C\u5F0F\u4E0D\u6B63\u786E\uFF0C\u671F\u671Bresults\u6570\u7EC4");
    }
    for (const item of data.data.results) {
      if (!item.nodeId || !item.suggestedName) {
        throw new Error("\u670D\u52A1\u5668\u8FD4\u56DE\u7684\u6570\u636E\u4E2D\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
      }
    }
    return data.data.results;
  }

  // src/code.ts
  figma.showUI(__html__, { width: 360, height: 500 });
  async function getElementContext(node) {
    let nodeName = node.name;
    let nodeType = node.type;
    let nodeDescription;
    let isComponent = false;
    let isInstance = false;
    let variantProperties;
    if (node.type === "INSTANCE") {
      isInstance = true;
      try {
        const instanceNode = node;
        const mainComponent = await instanceNode.getMainComponentAsync();
        if (mainComponent) {
          nodeName = mainComponent.name;
          nodeType = mainComponent.type;
          if ("description" in mainComponent) {
            const desc = mainComponent.description;
            if (typeof desc === "string" && desc) {
              nodeDescription = desc;
            }
          }
          if (instanceNode.variantProperties && typeof instanceNode.variantProperties === "object") {
            variantProperties = {};
            Object.keys(instanceNode.variantProperties).forEach((key) => {
              const value = instanceNode.variantProperties[key];
              if (typeof value === "string" || typeof value === "number") {
                variantProperties[key] = String(value);
              }
            });
          }
        } else {
          if ("description" in node) {
            const desc = node.description;
            if (typeof desc === "string" && desc) {
              nodeDescription = desc;
            }
          }
        }
      } catch (error) {
        console.warn("Failed to get main component, using instance node info:", error);
        if ("description" in node) {
          const desc = node.description;
          if (typeof desc === "string" && desc) {
            nodeDescription = desc;
          }
        }
      }
    } else {
      if ("description" in node) {
        const desc = node.description;
        if (typeof desc === "string" && desc) {
          nodeDescription = desc;
        }
      }
      if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
        isComponent = true;
      }
    }
    let parentName;
    let parentType;
    let siblingNames;
    if (node.parent && "name" in node.parent) {
      parentName = node.parent.name;
      parentType = node.parent.type;
      if ("children" in node.parent) {
        siblingNames = node.parent.children.filter((child) => child.id !== node.id).map((child) => child.name).slice(0, 10);
      }
    }
    let width;
    let height;
    let x;
    let y;
    if ("width" in node && typeof node.width === "number") {
      width = node.width;
    }
    if ("height" in node && typeof node.height === "number") {
      height = node.height;
    }
    if ("x" in node && typeof node.x === "number") {
      x = node.x;
    }
    if ("y" in node && typeof node.y === "number") {
      y = node.y;
    }
    let childrenCount;
    let childrenTypes;
    let childrenContent;
    if ("children" in node && Array.isArray(node.children)) {
      childrenCount = node.children.length;
      childrenTypes = node.children.map((child) => child.type).filter((type, index, arr) => arr.indexOf(type) === index).slice(0, 10);
      childrenContent = [];
      for (const child of node.children.slice(0, 20)) {
        if (child.type === "TEXT") {
          const textNode = child;
          try {
            const text = textNode.characters;
            if (text && text.trim()) {
              childrenContent.push(text);
            }
          } catch (_) {
          }
        }
      }
      if (childrenContent.length === 0) {
        childrenContent = void 0;
      }
    }
    let content;
    if (node.type === "TEXT") {
      const textNode = node;
      try {
        const text = textNode.characters;
        if (text && text.trim()) {
          content = text;
        }
      } catch (_) {
      }
    } else {
      try {
        const nodeData = {
          name: nodeName,
          type: nodeType,
          description: nodeDescription,
          width,
          height,
          x,
          y
        };
        if (node.type === "FRAME" || node.type === "GROUP") {
          const frameNode = node;
          if ("layoutMode" in frameNode) {
            nodeData.layoutMode = frameNode.layoutMode;
          }
          if ("primaryAxisSizingMode" in frameNode) {
            nodeData.primaryAxisSizingMode = frameNode.primaryAxisSizingMode;
          }
          if ("counterAxisSizingMode" in frameNode) {
            nodeData.counterAxisSizingMode = frameNode.counterAxisSizingMode;
          }
        }
        if (variantProperties) {
          nodeData.variantProperties = variantProperties;
        }
        if (isComponent) {
          nodeData.isComponent = true;
        }
        if (isInstance) {
          nodeData.isInstance = true;
        }
        content = JSON.stringify(nodeData, null, 2);
      } catch (_) {
        content = `${nodeType}: ${nodeName}`;
      }
    }
    return {
      nodeName,
      nodeType,
      nodeDescription,
      content,
      parentName,
      parentType,
      siblingNames,
      variantProperties,
      isComponent,
      isInstance,
      width,
      height,
      x,
      y,
      childrenCount,
      childrenTypes,
      childrenContent
    };
  }
  async function getSelectedNodeInfo() {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      return null;
    }
    const node = selection[0];
    const elementContext = await getElementContext(node);
    return {
      id: node.id,
      name: elementContext.nodeName,
      type: elementContext.nodeType
    };
  }
  async function getNodePreview(node) {
    try {
      const imageBytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 2 } });
      const base64String = figma.base64Encode(imageBytes);
      return `data:image/png;base64,${base64String}`;
    } catch (error) {
      console.warn("Failed to get preview image:", error);
      return null;
    }
  }
  async function checkSelection() {
    const nodeInfo = await getSelectedNodeInfo();
    console.log("Checking selection state, node info:", nodeInfo);
    let previewImage = null;
    if (nodeInfo) {
      try {
        const node = await figma.getNodeByIdAsync(nodeInfo.id);
        if (node && (node.type !== "PAGE" && node.type !== "DOCUMENT")) {
          previewImage = await getNodePreview(node);
        }
      } catch (error) {
        console.warn("Failed to get node preview image:", error);
      }
    }
    figma.ui.postMessage({
      type: "selection-changed",
      node: nodeInfo,
      previewImage
    });
  }
  checkSelection();
  figma.on("selectionchange", () => {
    checkSelection();
  });
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "check-selection") {
      await checkSelection();
    } else if (msg.type === "ai-name-request") {
      await handleAINamingRequest(msg.serverUrl, msg.apiKey || void 0, msg.nodeId);
    } else if (msg.type === "batch-name-request") {
      await handleBatchNamingRequest(msg.serverUrl, msg.apiKey || void 0, msg.nodeId);
    } else if (msg.type === "apply-name") {
      await handleApplyName(msg.nodeId, msg.newName);
    } else if (msg.type === "cancel") {
      figma.closePlugin();
    }
  };
  async function handleAINamingRequest(serverUrl, apiKey, nodeId) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        figma.ui.postMessage({
          type: "ai-naming-error",
          error: "Selected node not found"
        });
        return;
      }
      if (node.type === "PAGE" || node.type === "DOCUMENT") {
        figma.ui.postMessage({
          type: "ai-naming-error",
          error: "Cannot name page or document"
        });
        return;
      }
      const selection = figma.currentPage.selection;
      if (selection.length === 0 || selection[0].id !== nodeId) {
        figma.ui.postMessage({
          type: "ai-naming-error",
          error: "Selection has changed, please reselect"
        });
        return;
      }
      figma.ui.postMessage({
        type: "ai-naming-progress",
        message: "Capturing element screenshot..."
      });
      let screenshot;
      try {
        const imageBytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 2 } });
        const base64String = figma.base64Encode(imageBytes);
        screenshot = `data:image/png;base64,${base64String}`;
      } catch (error) {
        console.warn("Failed to capture screenshot:", error);
      }
      figma.ui.postMessage({
        type: "ai-naming-progress",
        message: "Analyzing element features..."
      });
      const elementContext = await getElementContext(node);
      const result = await generateAIName({
        serverUrl,
        nodeId,
        apiKey,
        elementContext,
        screenshot
      });
      figma.ui.postMessage({
        type: "ai-naming-success",
        suggestedName: result.suggestedName,
        reasoning: result.reasoning
      });
      figma.notify("AI naming suggestion generated");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("AI naming error:", error);
      figma.ui.postMessage({
        type: "ai-naming-error",
        error: errorMessage
      });
      figma.notify(`AI naming failed: ${errorMessage}`, { error: true });
    }
  }
  async function handleBatchNamingRequest(serverUrl, apiKey, nodeId) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        figma.ui.postMessage({
          type: "batch-naming-error",
          error: "Selected node not found"
        });
        return;
      }
      if (node.type === "PAGE" || node.type === "DOCUMENT") {
        figma.ui.postMessage({
          type: "batch-naming-error",
          error: "Cannot batch name page or document"
        });
        return;
      }
      const selection = figma.currentPage.selection;
      if (selection.length === 0 || selection[0].id !== nodeId) {
        figma.ui.postMessage({
          type: "batch-naming-error",
          error: "Selection has changed, please reselect"
        });
        return;
      }
      figma.ui.postMessage({
        type: "batch-naming-started",
        totalCount: 1
        // Only processing main frame
      });
      figma.ui.postMessage({
        type: "batch-naming-progress",
        current: 0,
        total: 1,
        message: "Collecting frame information..."
      });
      let screenshot;
      try {
        const imageBytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 2 } });
        const base64String = figma.base64Encode(imageBytes);
        screenshot = `data:image/png;base64,${base64String}`;
      } catch (error) {
        console.warn("Failed to capture screenshot:", error);
      }
      const elementContext = await getElementContext(node);
      figma.ui.postMessage({
        type: "batch-naming-progress",
        current: 1,
        total: 1,
        message: "Calling batch naming API..."
      });
      const batchResults = await generateBatchAIName({
        serverUrl,
        items: [{
          nodeId,
          elementContext,
          screenshot
        }],
        apiKey
      });
      let successCount = 0;
      let failCount = 0;
      const results = [];
      for (const result of batchResults) {
        try {
          const targetNode = await figma.getNodeByIdAsync(result.nodeId);
          if (targetNode && (targetNode.type === "PAGE" || targetNode.type === "DOCUMENT")) {
            failCount++;
            results.push({
              nodeId: result.nodeId,
              nodeName: "PAGE/DOCUMENT",
              error: "Cannot name page or document"
            });
            continue;
          }
          if (targetNode) {
            const oldName = targetNode.name;
            targetNode.name = result.suggestedName.trim();
            successCount++;
            results.push({
              nodeId: result.nodeId,
              nodeName: oldName,
              newName: result.suggestedName
            });
          } else {
            failCount++;
            results.push({
              nodeId: result.nodeId,
              nodeName: "Unknown",
              error: "Node does not exist"
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          failCount++;
          results.push({
            nodeId: result.nodeId,
            nodeName: "Unknown",
            error: errorMessage
          });
        }
      }
      figma.ui.postMessage({
        type: "batch-naming-completed",
        successCount,
        failCount,
        totalCount: batchResults.length,
        results
      });
      figma.notify(`Batch naming complete: ${successCount} succeeded, ${failCount} failed`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Batch naming error:", error);
      figma.ui.postMessage({
        type: "batch-naming-error",
        error: errorMessage
      });
      figma.notify(`Batch naming failed: ${errorMessage}`, { error: true });
    }
  }
  async function handleApplyName(nodeId, newName) {
    try {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        figma.ui.postMessage({
          type: "ai-naming-error",
          error: "Selected node not found"
        });
        return;
      }
      const selection = figma.currentPage.selection;
      if (selection.length === 0 || selection[0].id !== nodeId) {
        figma.ui.postMessage({
          type: "ai-naming-error",
          error: "Selection has changed, please reselect"
        });
        return;
      }
      if (!newName || newName.trim().length === 0) {
        figma.ui.postMessage({
          type: "ai-naming-error",
          error: "Name cannot be empty"
        });
        return;
      }
      node.name = newName.trim();
      figma.ui.postMessage({
        type: "name-applied"
      });
      figma.notify(`Name updated to: ${newName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Apply name error:", error);
      figma.ui.postMessage({
        type: "ai-naming-error",
        error: errorMessage
      });
      figma.notify(`Failed to apply name: ${errorMessage}`, { error: true });
    }
  }
})();
