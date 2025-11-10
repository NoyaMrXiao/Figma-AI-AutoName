// Figma Plugin Main Script - AI Auto Naming

// Declare __html__ variable (automatically injected by Figma plugin build tool)
declare const __html__: string;

import { generateAIName, generateBatchAIName } from './ai-service';

figma.showUI(__html__, { width: 360, height: 500 });

// Get complete element context information (supports dynamic-page)
async function getElementContext(node: SceneNode): Promise<{
  nodeName: string;
  nodeType: string;
  nodeDescription?: string;
  content?: string;
  parentName?: string;
  parentType?: string;
  siblingNames?: string[];
  variantProperties?: Record<string, string>;
  isComponent?: boolean;
  isInstance?: boolean;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  childrenCount?: number;
  childrenTypes?: string[];
  childrenContent?: string[];
}> {
  let nodeName = node.name;
  let nodeType = node.type;
  let nodeDescription: string | undefined;
  let isComponent = false;
  let isInstance = false;
  let variantProperties: Record<string, string> | undefined;
  
  // If it's an INSTANCE node, need to asynchronously get main component information
  if (node.type === 'INSTANCE') {
    isInstance = true;
    try {
      const instanceNode = node as InstanceNode;
      const mainComponent = await instanceNode.getMainComponentAsync();
      if (mainComponent) {
        // Use main component's name and type information
        nodeName = mainComponent.name;
        nodeType = mainComponent.type;
        if ('description' in mainComponent) {
          const desc = (mainComponent as any).description;
          if (typeof desc === 'string' && desc) {
            nodeDescription = desc;
          }
        }
        
        // Get variant properties
        if (instanceNode.variantProperties && typeof instanceNode.variantProperties === 'object') {
          variantProperties = {};
          Object.keys(instanceNode.variantProperties).forEach(key => {
            const value = instanceNode.variantProperties![key];
            if (typeof value === 'string' || typeof value === 'number') {
              variantProperties![key] = String(value);
            }
          });
        }
      } else {
        // If main component doesn't exist, use instance node's own information
        if ('description' in node) {
          const desc = (node as any).description;
          if (typeof desc === 'string' && desc) {
            nodeDescription = desc;
          }
        }
      }
    } catch (error) {
      // If getting main component fails, use instance node's own information
      console.warn('Failed to get main component, using instance node info:', error);
      if ('description' in node) {
        const desc = (node as any).description;
        if (typeof desc === 'string' && desc) {
          nodeDescription = desc;
        }
      }
    }
  } else {
    // For non-INSTANCE nodes, directly get description
    if ('description' in node) {
      const desc = (node as any).description;
      if (typeof desc === 'string' && desc) {
        nodeDescription = desc;
      }
    }
    
    // Check if it's a component
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      isComponent = true;
    }
  }
  
  // Get parent node information
  let parentName: string | undefined;
  let parentType: string | undefined;
  let siblingNames: string[] | undefined;
  
  if (node.parent && 'name' in node.parent) {
    parentName = node.parent.name;
    parentType = node.parent.type;
    
    // Get sibling node names
    if ('children' in node.parent) {
      siblingNames = node.parent.children
        .filter(child => child.id !== node.id)
        .map(child => child.name)
        .slice(0, 10); // Take up to 10 sibling nodes
    }
  }
  
  // Get layout information
  let width: number | undefined;
  let height: number | undefined;
  let x: number | undefined;
  let y: number | undefined;
  
  if ('width' in node && typeof node.width === 'number') {
    width = node.width;
  }
  if ('height' in node && typeof node.height === 'number') {
    height = node.height;
  }
  if ('x' in node && typeof node.x === 'number') {
    x = node.x;
  }
  if ('y' in node && typeof node.y === 'number') {
    y = node.y;
  }
  
  // Get child element information
  let childrenCount: number | undefined;
  let childrenTypes: string[] | undefined;
  let childrenContent: string[] | undefined;
  
  if ('children' in node && Array.isArray(node.children)) {
    childrenCount = node.children.length;
    childrenTypes = node.children
      .map(child => child.type)
      .filter((type, index, arr) => arr.indexOf(type) === index) // Remove duplicates
      .slice(0, 10); // Take up to 10 types
    
    // Get child elements' text content (if text nodes)
    childrenContent = [];
    for (const child of node.children.slice(0, 20)) { // Take up to 20 child elements
      if (child.type === 'TEXT') {
        const textNode = child as TextNode;
        try {
          const text = textNode.characters;
          if (text && text.trim()) {
            childrenContent.push(text);
          }
        } catch (_) {
          // Ignore unreadable text nodes
        }
      }
    }
    if (childrenContent.length === 0) {
      childrenContent = undefined;
    }
  }
  
  // Get node's own text content
  let content: string | undefined;
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    try {
      const text = textNode.characters;
      if (text && text.trim()) {
        content = text;
      }
    } catch (_) {
      // Ignore unreadable text
    }
  } else {
    // For non-text nodes, serialize node information to JSON text
    try {
      const nodeData: any = {
        name: nodeName,
        type: nodeType,
        description: nodeDescription,
        width: width,
        height: height,
        x: x,
        y: y
      };
      
      // Add type-specific properties
      if (node.type === 'FRAME' || node.type === 'GROUP') {
        const frameNode = node as FrameNode | GroupNode;
        if ('layoutMode' in frameNode) {
          nodeData.layoutMode = frameNode.layoutMode;
        }
        if ('primaryAxisSizingMode' in frameNode) {
          nodeData.primaryAxisSizingMode = frameNode.primaryAxisSizingMode;
        }
        if ('counterAxisSizingMode' in frameNode) {
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
      
      // Convert JSON data to text
      content = JSON.stringify(nodeData, null, 2);
    } catch (_) {
      // If serialization fails, use simple text description
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

// Get selected node information (async version, supports dynamic-page)
async function getSelectedNodeInfo() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    return null;
  }

  // Only process the first selected node
  const node = selection[0];
  const elementContext = await getElementContext(node);
  
  return {
    id: node.id,
    name: elementContext.nodeName,
    type: elementContext.nodeType
  };
}

// Get node preview image (PNG format, base64 encoded)
async function getNodePreview(node: SceneNode): Promise<string | null> {
  try {
    const imageBytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
    // Convert Uint8Array to base64
    const base64String = figma.base64Encode(imageBytes);
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    console.warn('Failed to get preview image:', error);
    return null;
  }
}

// Check selection state and send to UI (async version)
async function checkSelection() {
  const nodeInfo = await getSelectedNodeInfo();
  
  console.log('Checking selection state, node info:', nodeInfo);
  
  let previewImage: string | null = null;
  
  // If a node is selected, get preview image
  if (nodeInfo) {
    try {
      const node = await figma.getNodeByIdAsync(nodeInfo.id);
      if (node && (node.type !== 'PAGE' && node.type !== 'DOCUMENT')) {
        previewImage = await getNodePreview(node as SceneNode);
      }
    } catch (error) {
      console.warn('Failed to get node preview image:', error);
    }
  }
  
  figma.ui.postMessage({
    type: 'selection-changed',
    node: nodeInfo,
    previewImage: previewImage
  });
}

// Check selection state on initialization
checkSelection();

// Listen for selection changes
figma.on('selectionchange', () => {
  checkSelection();
});

// Recursively collect all child frames (including self)
async function collectAllFrames(node: SceneNode): Promise<SceneNode[]> {
  const frames: SceneNode[] = [];
  
  // If current node is FRAME, add to list
  if (node.type === 'FRAME') {
    frames.push(node);
  }
  
  // Recursively process child nodes
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childFrames = await collectAllFrames(child as SceneNode);
      frames.push(...childFrames);
    }
  }
  
  return frames;
}

// Handle UI messages
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'check-selection') {
    await checkSelection();
  } else if (msg.type === 'ai-name-request') {
    await handleAINamingRequest(msg.serverUrl, msg.apiKey || undefined, msg.nodeId);
  } else if (msg.type === 'batch-name-request') {
    await handleBatchNamingRequest(msg.serverUrl, msg.apiKey || undefined, msg.nodeId);
  } else if (msg.type === 'apply-name') {
    await handleApplyName(msg.nodeId, msg.newName);
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// Handle AI naming request
async function handleAINamingRequest(serverUrl: string, apiKey: string | undefined, nodeId: string) {
  try {
    // Find node (using async method, supports dynamic-page)
    const node = await figma.getNodeByIdAsync(nodeId);
    
    if (!node) {
      figma.ui.postMessage({
        type: 'ai-naming-error',
        error: 'Selected node not found'
      });
      return;
    }

    // Ensure node is SceneNode type
    if (node.type === 'PAGE' || node.type === 'DOCUMENT') {
      figma.ui.postMessage({
        type: 'ai-naming-error',
        error: 'Cannot name page or document'
      });
      return;
    }

    // Check if node is still selected
    const selection = figma.currentPage.selection;
    if (selection.length === 0 || selection[0].id !== nodeId) {
      figma.ui.postMessage({
        type: 'ai-naming-error',
        error: 'Selection has changed, please reselect'
      });
      return;
    }

    // Send progress message
    figma.ui.postMessage({
      type: 'ai-naming-progress',
      message: 'Capturing element screenshot...'
    });

    // Get element screenshot (PNG format, base64 encoded)
    let screenshot: string | undefined;
    try {
      const imageBytes = await (node as SceneNode).exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
      // Convert Uint8Array to base64
      const base64String = figma.base64Encode(imageBytes);
      screenshot = `data:image/png;base64,${base64String}`;
    } catch (error) {
      console.warn('Failed to capture screenshot:', error);
      // If screenshot fails, continue without screenshot
    }

    // Send progress message
    figma.ui.postMessage({
      type: 'ai-naming-progress',
      message: 'Analyzing element features...'
    });

    // Get complete element context information
    const elementContext = await getElementContext(node as SceneNode);

    // Call AI service to generate name (via server)
    const result = await generateAIName({
      serverUrl: serverUrl,
      nodeId: nodeId,
      apiKey: apiKey,
      elementContext: elementContext,
      screenshot: screenshot
    });

    // Send success message
    figma.ui.postMessage({
      type: 'ai-naming-success',
      suggestedName: result.suggestedName,
      reasoning: result.reasoning
    });

    figma.notify('AI naming suggestion generated');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('AI naming error:', error);
    
    figma.ui.postMessage({
      type: 'ai-naming-error',
      error: errorMessage
    });
    
    figma.notify(`AI naming failed: ${errorMessage}`, { error: true });
  }
}

// Handle batch naming request
async function handleBatchNamingRequest(serverUrl: string, apiKey: string | undefined, nodeId: string) {
  try {
    // Find node (using async method, supports dynamic-page)
    const node = await figma.getNodeByIdAsync(nodeId);
    
    if (!node) {
      figma.ui.postMessage({
        type: 'batch-naming-error',
        error: 'Selected node not found'
      });
      return;
    }

    // Ensure node is SceneNode type
    if (node.type === 'PAGE' || node.type === 'DOCUMENT') {
      figma.ui.postMessage({
        type: 'batch-naming-error',
        error: 'Cannot batch name page or document'
      });
      return;
    }

    // Check if node is still selected
    const selection = figma.currentPage.selection;
    if (selection.length === 0 || selection[0].id !== nodeId) {
      figma.ui.postMessage({
        type: 'batch-naming-error',
        error: 'Selection has changed, please reselect'
      });
      return;
    }

    // According to API docs, /api/name/frame endpoint analyzes entire frame structure at once
    // Returns all nodes that need naming (including child frames), so only need to send main frame info

    // Send start message
    figma.ui.postMessage({
      type: 'batch-naming-started',
      totalCount: 1 // Only processing main frame
    });

    // Send progress message: preparing data
    figma.ui.postMessage({
      type: 'batch-naming-progress',
      current: 0,
      total: 1,
      message: 'Collecting frame information...'
    });

    // Get main frame screenshot
    let screenshot: string | undefined;
    try {
      const imageBytes = await (node as SceneNode).exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
      const base64String = figma.base64Encode(imageBytes);
      screenshot = `data:image/png;base64,${base64String}`;
    } catch (error) {
      console.warn('Failed to capture screenshot:', error);
    }

    // Get main frame context information
    const elementContext = await getElementContext(node as SceneNode);

    // Send progress message: calling API
    figma.ui.postMessage({
      type: 'batch-naming-progress',
      current: 1,
      total: 1,
      message: 'Calling batch naming API...'
    });

    // Call batch AI service to generate names (only send main frame, server returns all nodes that need naming)
    const batchResults = await generateBatchAIName({
      serverUrl: serverUrl,
      items: [{
        nodeId: nodeId,
        elementContext: elementContext,
        screenshot: screenshot
      }],
      apiKey: apiKey
    });

    // Apply batch returned names
    let successCount = 0;
    let failCount = 0;
    const results: Array<{ nodeId: string; nodeName: string; newName?: string; error?: string }> = [];

    // Apply names and count results
    // Server returned nodeIds may include main frame and all child frames
    for (const result of batchResults) {
      try {
        // Find corresponding node
        const targetNode = await figma.getNodeByIdAsync(result.nodeId);
        if (targetNode && (targetNode.type === 'PAGE' || targetNode.type === 'DOCUMENT')) {
          // Skip page and document nodes
          failCount++;
          results.push({
            nodeId: result.nodeId,
            nodeName: 'PAGE/DOCUMENT',
            error: 'Cannot name page or document'
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
          // Node doesn't exist or has been deleted
          failCount++;
          results.push({
            nodeId: result.nodeId,
            nodeName: 'Unknown',
            error: 'Node does not exist'
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        failCount++;
        results.push({
          nodeId: result.nodeId,
          nodeName: 'Unknown',
          error: errorMessage
        });
      }
    }

    // Send completion message
    figma.ui.postMessage({
      type: 'batch-naming-completed',
      successCount: successCount,
      failCount: failCount,
      totalCount: batchResults.length,
      results: results
    });

    figma.notify(`Batch naming complete: ${successCount} succeeded, ${failCount} failed`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Batch naming error:', error);
    
    figma.ui.postMessage({
      type: 'batch-naming-error',
      error: errorMessage
    });
    
    figma.notify(`Batch naming failed: ${errorMessage}`, { error: true });
  }
}

// Handle apply name request
async function handleApplyName(nodeId: string, newName: string) {
  try {
    // Find node (using async method, supports dynamic-page)
    const node = await figma.getNodeByIdAsync(nodeId);
    
    if (!node) {
      figma.ui.postMessage({
        type: 'ai-naming-error',
        error: 'Selected node not found'
      });
      return;
    }

    // Check if node is still selected
    const selection = figma.currentPage.selection;
    if (selection.length === 0 || selection[0].id !== nodeId) {
      figma.ui.postMessage({
        type: 'ai-naming-error',
        error: 'Selection has changed, please reselect'
      });
      return;
    }

    // Validate name
    if (!newName || newName.trim().length === 0) {
      figma.ui.postMessage({
        type: 'ai-naming-error',
        error: 'Name cannot be empty'
      });
      return;
    }

    // Apply new name
    node.name = newName.trim();

    // Send success message
    figma.ui.postMessage({
      type: 'name-applied'
    });

    figma.notify(`Name updated to: ${newName}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Apply name error:', error);
    
    figma.ui.postMessage({
      type: 'ai-naming-error',
      error: errorMessage
    });
    
    figma.notify(`Failed to apply name: ${errorMessage}`, { error: true });
  }
}
