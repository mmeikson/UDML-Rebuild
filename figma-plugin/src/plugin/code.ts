// This is the main entry point for the Figma plugin code
// It runs in the context of the Figma plugin environment

console.log('Plugin code.js loaded');

// Show UI with dimensions
console.log('Showing UI...');
figma.showUI(__html__, { width: 450, height: 550 });
console.log('UI shown, waiting for messages...');

/**
 * Extract variable information from a node
 * @param node The Figma node to extract variable information from
 * @returns Object containing variable data
 */
function extractVariableReferences(node: any): any {
  const variableData: any = {};
  
  // Check if node has variable bindings
  if ('boundVariables' in node) {
    try {
      const boundVars = node.boundVariables;
      if (boundVars && Object.keys(boundVars).length > 0) {
        console.log(`🔄 Found ${Object.keys(boundVars).length} bound variables on node "${node.name}"`);
        variableData.boundVariables = {};
        
        // Loop through all bound variables
        for (const property in boundVars) {
          const binding = boundVars[property];
          if (binding) {
            const variableId = binding.id;
            console.log(`  → Variable bound to property "${property}" with ID: ${variableId}`);
            
            // Try to get the variable metadata using the Figma API
            try {
              const variable = figma.variables.getVariableById(variableId);
              if (variable) {
                console.log(`    ✓ Found variable: "${variable.name}" (${variable.resolvedType})`);
                variableData.boundVariables[property] = {
                  id: variable.id,
                  name: variable.name,
                  resolvedType: variable.resolvedType,
                  key: variable.key,
                  variableCollectionId: variable.variableCollectionId
                };
                
                // Try to get the collection info as well
                try {
                  const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
                  if (collection) {
                    console.log(`    ✓ From collection: "${collection.name}"`);
                    variableData.boundVariables[property].collectionName = collection.name;
                  }
                } catch (collectionError) {
                  console.warn('Could not get variable collection:', collectionError);
                }
              }
            } catch (variableError) {
              console.warn('Could not get variable details:', variableError);
              // Still include what we know
              variableData.boundVariables[property] = {
                id: variableId
              };
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error extracting bound variables:', error);
    }
  }
  
  return Object.keys(variableData).length > 0 ? variableData : null;
}

/**
 * Extract style information from a node
 * @param node The Figma node to extract style information from
 * @returns Object containing style data
 */
function extractStyleReferences(node: any): any {
  const styleData: any = {};
  let stylesFound = 0;
  
  // Extract fill styles
  if ('fillStyleId' in node && node.fillStyleId) {
    try {
      const style = figma.getStyleById(node.fillStyleId as string);
      if (style) {
        console.log(`🎨 Found fill style on node "${node.name}": "${style.name}"`);
        stylesFound++;
        styleData.fillStyle = {
          id: style.id,
          name: style.name,
          type: style.type
        };
      }
    } catch (error) {
      console.warn('Error extracting fill style:', error);
    }
  }
  
  // Extract text styles
  if ('textStyleId' in node && node.textStyleId) {
    try {
      const style = figma.getStyleById(node.textStyleId as string);
      if (style) {
        console.log(`🎨 Found text style on node "${node.name}": "${style.name}"`);
        stylesFound++;
        styleData.textStyle = {
          id: style.id,
          name: style.name,
          type: style.type
        };
      }
    } catch (error) {
      console.warn('Error extracting text style:', error);
    }
  }
  
  // Extract stroke styles
  if ('strokeStyleId' in node && node.strokeStyleId) {
    try {
      const style = figma.getStyleById(node.strokeStyleId as string);
      if (style) {
        console.log(`🎨 Found stroke style on node "${node.name}": "${style.name}"`);
        stylesFound++;
        styleData.strokeStyle = {
          id: style.id,
          name: style.name,
          type: style.type
        };
      }
    } catch (error) {
      console.warn('Error extracting stroke style:', error);
    }
  }
  
  // Extract effect styles
  if ('effectStyleId' in node && node.effectStyleId) {
    try {
      const style = figma.getStyleById(node.effectStyleId as string);
      if (style) {
        console.log(`🎨 Found effect style on node "${node.name}": "${style.name}"`);
        stylesFound++;
        styleData.effectStyle = {
          id: style.id,
          name: style.name,
          type: style.type
        };
      }
    } catch (error) {
      console.warn('Error extracting effect style:', error);
    }
  }
  
  // Extract grid styles
  if ('gridStyleId' in node && node.gridStyleId) {
    try {
      const style = figma.getStyleById(node.gridStyleId as string);
      if (style) {
        console.log(`🎨 Found grid style on node "${node.name}": "${style.name}"`);
        stylesFound++;
        styleData.gridStyle = {
          id: style.id,
          name: style.name,
          type: style.type
        };
      }
    } catch (error) {
      console.warn('Error extracting grid style:', error);
    }
  }
  
  if (stylesFound > 0) {
    console.log(`👉 Total styles found on node "${node.name}": ${stylesFound}`);
  }
  
  return Object.keys(styleData).length > 0 ? styleData : null;
}

/**
 * Recursively extract node data and properties
 * @param node The Figma node to extract data from
 * @returns Object containing node data
 */
function extractNodeData(node: BaseNode): any {
  // Base properties all nodes share
  const nodeData: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  // Add specific properties based on node type
  if ('visible' in node) {
    nodeData.visible = node.visible;
  }

  // Handle different node types
  if ('fills' in node) {
    nodeData.fills = node.fills;
  }

  if ('strokes' in node) {
    nodeData.strokes = node.strokes;
  }

  if ('strokeWeight' in node) {
    nodeData.strokeWeight = node.strokeWeight;
  }

  if ('effects' in node) {
    nodeData.effects = node.effects;
  }

  // Handle frame-specific properties
  if ('width' in node && 'height' in node) {
    nodeData.width = node.width;
    nodeData.height = node.height;
  }

  if ('x' in node && 'y' in node) {
    nodeData.x = node.x;
    nodeData.y = node.y;
  }

  if ('layoutMode' in node) {
    nodeData.layoutMode = node.layoutMode;
  }

  if ('paddingLeft' in node) {
    nodeData.padding = {
      left: node.paddingLeft,
      right: node.paddingRight,
      top: node.paddingTop,
      bottom: node.paddingBottom
    };
  }

  if ('characters' in node) {
    nodeData.characters = node.characters;
    if ('fontSize' in node) nodeData.fontSize = node.fontSize;
    if ('fontName' in node) nodeData.fontName = node.fontName;
    if ('textAlignHorizontal' in node) nodeData.textAlignHorizontal = node.textAlignHorizontal;
    if ('textAlignVertical' in node) nodeData.textAlignVertical = node.textAlignVertical;
  }

  // Extract variable references
  const variableRefs = extractVariableReferences(node);
  if (variableRefs) {
    nodeData.variables = variableRefs;
  }

  // Extract style references
  const styleRefs = extractStyleReferences(node);
  if (styleRefs) {
    nodeData.styles = styleRefs;
  }
  
  // Extract component information if this is an instance
  if (node.type === 'INSTANCE') {
    const instance = node as InstanceNode;
    nodeData.component = {
      id: instance.mainComponent ? instance.mainComponent.id : 'Unknown',
      name: instance.mainComponent ? instance.mainComponent.name : 'Unknown'
    };
  }

  // Recursively process children
  if ('children' in node) {
    nodeData.children = [];
    for (const child of node.children) {
      nodeData.children.push(extractNodeData(child));
    }
  }

  return nodeData;
}

// Message handler for communication between the plugin and UI
figma.ui.onmessage = async (msg) => {
  console.log('→→→ RECEIVED MESSAGE FROM UI:', msg);
  
  try {
    if (msg.type === 'extract-frame') {
      console.log('Processing extract-frame request');
      try {
        // Validate selection
        if (!figma.currentPage.selection.length) {
          console.log('Error: No selection');
          figma.ui.postMessage({
            type: 'error',
            message: 'Please select a frame to extract'
          });
          return;
        }

        const selectedNode = figma.currentPage.selection[0];
        if (selectedNode.type !== 'FRAME' && selectedNode.type !== 'COMPONENT' && selectedNode.type !== 'INSTANCE') {
          console.log('Error: Invalid selection type:', selectedNode.type);
          figma.ui.postMessage({
            type: 'error',
            message: 'Please select a frame, component, or instance'
          });
          return;
        }

        console.log('Valid selection, extracting data...');
        // Extract complete node hierarchy
        const extractedData = extractNodeData(selectedNode);
        const nodeJson = JSON.stringify(extractedData, null, 2);
        
        console.log('Sending extraction complete message to UI');
        // In a real implementation, this would export an actual PNG/JPG
        // Here we just notify that we would need to export it
        figma.ui.postMessage({
          type: 'extraction-complete',
          data: {
            json: nodeJson,
            name: selectedNode.name
          }
        });
        
        // Don't close the plugin automatically - wait for user action
        console.log('Extraction complete - waiting for user to close');
      } catch (error: any) {
        console.error('Extraction error:', error);
        figma.ui.postMessage({
          type: 'error',
          message: `Error extracting frame: ${error && error.message ? error.message : String(error)}`
        });
      }
    } else if (msg.type === 'close') {
      console.log('Closing plugin on user request');
      figma.closePlugin();
    } else {
      console.log('Unknown message type:', msg.type);
    }
  } catch (error: any) {
    console.error('Error handling message:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `Plugin error: ${error && error.message ? error.message : String(error)}`
    });
  }
};

// Notify UI that plugin is ready
console.log('Sending plugin-ready message to UI');
figma.ui.postMessage({ type: 'plugin-ready' });
console.log('Plugin-ready message sent');

// Send selection details to the UI
function sendSelectionDetails() {
  console.log('Selection changed, updating UI');
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    console.log('No selection, sending update to UI');
    figma.ui.postMessage({ type: 'selection-update', selection: null });
    return;
  }
  const node = selection[0];
  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    console.log('Valid selection, sending details to UI:', node.name);
    figma.ui.postMessage({
      type: 'selection-update',
      selection: {
        id: node.id,
        name: node.name,
        type: node.type,
        width: node.width,
        height: node.height,
        parent: node.parent ? node.parent.name : null
      }
    });
  } else {
    console.log('Invalid selection type, sending null to UI');
    figma.ui.postMessage({ type: 'selection-update', selection: null });
  }
}

// Listen for selection changes
console.log('Setting up selection change listener');
figma.on('selectionchange', sendSelectionDetails);

// Send initial selection state
console.log('Sending initial selection state');
sendSelectionDetails(); 