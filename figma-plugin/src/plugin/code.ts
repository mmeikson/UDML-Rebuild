// This is the main entry point for the Figma plugin code
// It runs in the context of the Figma plugin environment

console.log('Plugin code.js loaded');

// Show UI with dimensions
console.log('Showing UI...');
figma.showUI(__html__, { width: 450, height: 550 });
console.log('UI shown, waiting for messages...');

// Add a recursion depth counter at the top of the file to limit component extraction depth
let extractionDepth = 0;
const MAX_EXTRACTION_DEPTH = 5; // Limit recursion to 5 levels deep

// Create a global set to track which components we've already processed
const processedComponentIds = new Set<string>();

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
 * Extract comprehensive component information from a node
 * @param node The Figma node to extract component information from
 * @returns Object containing component data
 */
function extractComponentReferences(node: any): any {
  const componentData: any = {};
  
  try {
    console.log(`[extractComponentReferences:start] Processing node type: ${node.type}, id: ${node.id}, name: ${node.name}`);
    
    // Handle INSTANCE nodes - extract main component, properties, and overrides
    if (node.type === 'INSTANCE') {
      console.log(`[extractComponentReferences:INSTANCE] Processing instance node: ${node.name}`);
      const instance = node as InstanceNode;
      if (instance.mainComponent) {
        console.log(`🧩 Found instance on node "${node.name}" of component: "${instance.mainComponent.name}"`);
        componentData.mainComponent = {
          id: instance.mainComponent.id,
          name: instance.mainComponent.name,
          key: instance.mainComponent.key
        };
        
        // Extract the complete node structure of the main component
        try {
          console.log(`[extractComponentReferences:mainComponentStructure] Extracting structure of component: "${instance.mainComponent.name}"`);
          // Use the dedicated function for component structure extraction
          componentData.mainComponent.structure = extractComponentStructure(instance.mainComponent, 0);
        } catch (structureError) {
          console.warn(`[extractComponentReferences:mainComponentError] Error extracting main component structure:`, structureError);
          // Fall back to safe extraction if there's an error
          componentData.mainComponent.safeStructure = {
            id: instance.mainComponent.id,
            name: instance.mainComponent.name,
            type: instance.mainComponent.type,
            key: instance.mainComponent.key,
            // Add basic properties where available without recursion
            description: (instance.mainComponent as ComponentNode).description || null,
            width: 'width' in instance.mainComponent ? instance.mainComponent.width : undefined,
            height: 'height' in instance.mainComponent ? instance.mainComponent.height : undefined
          };
        }
        
        // Handle component properties with better error handling
        try {
          console.log(`[extractComponentReferences:componentProperties] Checking for component properties`);
          if ('componentProperties' in instance && instance.componentProperties) {
            const properties = instance.componentProperties;
            if (properties && Object.keys(properties).length > 0) {
              console.log(`🧩 Found ${Object.keys(properties).length} component properties on instance "${node.name}"`);
              componentData.componentProperties = {};
              
              for (const property in properties) {
                try {
                  const propDetails = properties[property];
                  componentData.componentProperties[property] = {
                    type: propDetails.type,
                    value: propDetails.value
                  };
                } catch (propError) {
                  console.warn(`[extractComponentReferences:propertyError] Error processing property ${property}:`, propError);
                }
              }
            }
          }
        } catch (propsError) {
          console.warn(`[extractComponentReferences:propertiesError] Error extracting component properties:`, propsError);
        }
        
        // Enhanced Component Set Extraction
        try {
          console.log(`[extractComponentReferences:componentSetCheck] Checking for parent component set`);
          if (instance.mainComponent.parent) {
            // Check if parent is a component set
            if (instance.mainComponent.parent.type === 'COMPONENT_SET') {
              const componentSet = instance.mainComponent.parent as ComponentSetNode;
              console.log(`[extractComponentReferences:componentSetFound] Found component set: "${componentSet.name}" for instance "${node.name}"`);
              
              componentData.componentSet = {
                id: componentSet.id,
                name: componentSet.name,
                key: componentSet.key,
                isVariantSource: true
              };
              
              // Extract the complete component set structure
              try {
                console.log(`🧩 Extracting complete structure of component set: "${componentSet.name}"`);
                // IMPORTANT: Instead of extracting the full structure which causes API errors,
                // we'll extract just the essential metadata about the component set
                componentData.componentSet.safeStructure = {
                  id: componentSet.id,
                  name: componentSet.name,
                  type: componentSet.type,
                  children: componentSet.children ? componentSet.children.map(child => ({
                    id: child.id,
                    name: child.name,
                    type: child.type,
                    // Don't extract nested structures for children to avoid recursion
                  })) : []
                };
                
                // Don't extract full structure recursively - this is causing the API error in func147
                console.log(`[extractComponentReferences:safeExtraction] Using safe extraction for component set to avoid API errors`);
              } catch (setStructureError) {
                console.warn('Error extracting component set structure:', setStructureError);
                // Don't rethrow to prevent loop
              }
              
              // Extract variant properties
              if ('variantProperties' in instance.mainComponent) {
                const variantProps = instance.mainComponent.variantProperties;
                if (variantProps && Object.keys(variantProps).length > 0) {
                  componentData.variantProperties = {};
                  for (const prop in variantProps) {
                    componentData.variantProperties[prop] = variantProps[prop];
                  }
                }
              }
            } else {
              // For non-component set parents, still store the parent information
              const parent = instance.mainComponent.parent;
              componentData.parent = {
                id: parent.id,
                name: parent.name,
                type: parent.type
              };
            }
          }
        } catch (setError) {
          console.warn('Error extracting component set details:', setError);
        }
      }
    }
    
    // Handle COMPONENT nodes - extract definition details
    if (node.type === 'COMPONENT') {
      const component = node as ComponentNode;
      console.log(`🧩 Found component definition: "${component.name}"`);
      
      componentData.componentDefinition = {
        id: component.id,
        name: component.name,
        key: component.key,
        description: component.description || null
      };
      
      // Enhanced Component Set Extraction for component definitions
      try {
        if (component.parent) {
          if (component.parent.type === 'COMPONENT_SET') {
            const componentSet = component.parent as ComponentSetNode;
            console.log(`🧩 Component "${component.name}" belongs to component set: "${componentSet.name}"`);
            
            componentData.componentSet = {
              id: componentSet.id,
              name: componentSet.name,
              key: componentSet.key,
              isVariantSource: true
            };
            
            // Extract the complete component set structure
            try {
              console.log(`🧩 Extracting complete structure of component set: "${componentSet.name}"`);
              // IMPORTANT: Instead of extracting the full structure which causes API errors,
              // we'll extract just the essential metadata about the component set
              componentData.componentSet.safeStructure = {
                id: componentSet.id,
                name: componentSet.name,
                type: componentSet.type,
                children: componentSet.children ? componentSet.children.map(child => ({
                  id: child.id,
                  name: child.name,
                  type: child.type,
                  // Don't extract nested structures for children to avoid recursion
                })) : []
              };
              
              // Don't extract full structure recursively - this is causing the API error in func147
              console.log(`[extractComponentReferences:safeExtraction] Using safe extraction for component set to avoid API errors`);
            } catch (setStructureError) {
              console.warn('Error extracting component set structure:', setStructureError);
              // Don't rethrow to prevent loop
            }
            
            // Get variant properties for this component
            if ('variantProperties' in component) {
              const variantProps = component.variantProperties;
              if (variantProps && Object.keys(variantProps).length > 0) {
                componentData.variantProperties = {};
                for (const prop in variantProps) {
                  componentData.variantProperties[prop] = variantProps[prop];
                }
              }
            }
          } else {
            // For non-component set parents, still store the parent information
            const parent = component.parent;
            componentData.parent = {
              id: parent.id,
              name: parent.name,
              type: parent.type
            };
          }
        }
      } catch (setError) {
        console.warn('Error extracting component set for component:', setError);
      }
    }
    
    // Handle COMPONENT_SET nodes - extract set information and variant properties
    if (node.type === 'COMPONENT_SET') {
      const componentSet = node as ComponentSetNode;
      console.log(`🧩 Found component set: "${componentSet.name}"`);
      
      componentData.componentSetDefinition = {
        id: componentSet.id,
        name: componentSet.name,
        key: componentSet.key
      };
      
      // Extract variant properties if available
      try {
        if ('variantGroupProperties' in componentSet) {
          const variantProps = componentSet.variantGroupProperties;
          if (variantProps && Object.keys(variantProps).length > 0) {
            console.log(`🧩 Found ${Object.keys(variantProps).length} variant properties on component set "${componentSet.name}"`);
            componentData.variantGroupProperties = {};
            
            for (const variant in variantProps) {
              componentData.variantGroupProperties[variant] = {
                values: variantProps[variant].values
              };
            }
          }
        }
        
        // Extract all child components (variants)
        if (componentSet.children && componentSet.children.length > 0) {
          componentData.variants = [];
          for (const child of componentSet.children) {
            if (child.type === 'COMPONENT') {
              console.log(`🧩 Found variant "${child.name}" in component set "${componentSet.name}"`);
              
              try {
                // Use the dedicated function for component structure extraction
                const variantStructure = extractComponentStructure(child as ComponentNode, 0);
                componentData.variants.push(variantStructure);
              } catch (variantError: unknown) {
                console.warn(`Error extracting variant structure for "${child.name}":`, variantError);
                
                // Fall back to minimal structure
                componentData.variants.push({
                  id: child.id,
                  name: child.name,
                  key: (child as ComponentNode).key,
                  error: true
                });
              }
            }
          }
        }
      } catch (variantError) {
        console.warn('Error extracting variant properties:', variantError);
      }
    }
  } catch (error) {
    console.warn('Error extracting component references:', error);
  }
  
  return Object.keys(componentData).length > 0 ? componentData : null;
}

/**
 * Recursively extract node data and properties
 * @param node The Figma node to extract data from
 * @param depth Current recursion depth
 * @returns Object containing node data
 */
function extractNodeData(node: BaseNode, depth: number = 0): any {
  // Protect against excessive recursion
  if (depth > MAX_EXTRACTION_DEPTH) {
    console.warn(`[extractNodeData:maxDepthReached] Max recursion depth (${MAX_EXTRACTION_DEPTH}) reached for node ${node.id}. Stopping recursion.`);
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      note: "Max recursion depth reached"
    };
  }
  
  // Track current extraction depth
  extractionDepth = Math.max(extractionDepth, depth);
  
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

  // Extract variable references - store only the reference IDs, not full data
  const variableRefs = extractVariableReferences(node);
  if (variableRefs && variableRefs.boundVariables) {
    // Store just the variable references instead of full variable data
    nodeData.variableReferences = {};
    for (const prop in variableRefs.boundVariables) {
      const variable = variableRefs.boundVariables[prop];
      nodeData.variableReferences[prop] = variable.id;
    }
  }

  // Extract style references - store only the reference IDs, not full data
  const styleRefs = extractStyleReferences(node);
  if (styleRefs) {
    // Store just the style references instead of full style data
    nodeData.styleReferences = {};
    if (styleRefs.fillStyle) nodeData.styleReferences.fill = styleRefs.fillStyle.id;
    if (styleRefs.textStyle) nodeData.styleReferences.text = styleRefs.textStyle.id;
    if (styleRefs.strokeStyle) nodeData.styleReferences.stroke = styleRefs.strokeStyle.id;
    if (styleRefs.effectStyle) nodeData.styleReferences.effect = styleRefs.effectStyle.id;
    if (styleRefs.gridStyle) nodeData.styleReferences.grid = styleRefs.gridStyle.id;
  }
  
  // Extract component information - store only the reference IDs, not full data
  const componentRefs = extractComponentReferences(node);
  if (componentRefs) {
    // Store just the component references instead of full component data
    nodeData.componentReferences = {};
    
    if (componentRefs.mainComponent) {
      nodeData.componentReferences.mainComponent = componentRefs.mainComponent.id;
    }
    
    if (componentRefs.componentDefinition) {
      nodeData.componentReferences.componentDefinition = componentRefs.componentDefinition.id;
    }
    
    if (componentRefs.componentSet) {
      nodeData.componentReferences.componentSet = componentRefs.componentSet.id;
    }
    
    if (componentRefs.componentSetDefinition) {
      nodeData.componentReferences.componentSetDefinition = componentRefs.componentSetDefinition.id;
    }
    
    // Store component properties directly as they're not shared/repeated
    if (componentRefs.componentProperties) {
      nodeData.componentProperties = componentRefs.componentProperties;
    }
    
    // Store variant properties directly as they're not shared/repeated
    if (componentRefs.variantProperties) {
      nodeData.variantProperties = componentRefs.variantProperties;
    }
    
    // Store variant group properties directly as they're not shared/repeated
    if (componentRefs.variantGroupProperties) {
      nodeData.variantGroupProperties = componentRefs.variantGroupProperties;
    }
    
    // Keep track of variants for component sets
    if (componentRefs.variants) {
      nodeData.componentReferences.variants = componentRefs.variants.map((variant: any) => variant.id);
    }
  }

  // Recursively process children
  if ('children' in node) {
    nodeData.children = [];
    for (const child of node.children) {
      nodeData.children.push(extractNodeData(child, depth + 1));
    }
  }

  return nodeData;
}

/**
 * Structure and validate extracted data to ensure integrity and organization
 * @param extractedData Raw data extracted from the node
 * @returns Structured and validated data
 */
function structureAndValidateData(extractedData: any): any {
  console.log('Structuring and validating extracted data...');
  
  // Initialize the structured data container
  const structuredData: any = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      validationStatus: 'valid', // Will be set to 'invalid' if issues found
      validationIssues: [],
      statistics: {
        totalNodes: 0,
        styles: {
          total: 0,
          fill: 0,
          text: 0,
          stroke: 0,
          effect: 0,
          grid: 0
        },
        variables: {
          total: 0,
          byType: {}
        },
        components: {
          total: 0,
          instances: 0,
          mainComponents: 0,
          componentSets: 0
        }
      }
    },
    design: {
      rootNode: null,    // Will contain the actual node hierarchy
      styles: {},        // Style dictionary by ID
      variables: {},     // Variable dictionary by ID
      components: {},    // Component dictionary by ID
      componentSets: {}  // Component sets dictionary by ID
    }
  };
  
  // Copy the root node to the structured data
  structuredData.design.rootNode = extractedData;
  
  // Initialize sets to keep track of unique IDs
  const styleIds = new Set<string>();
  const variableIds = new Set<string>();
  const componentIds = new Set<string>();
  const componentSetIds = new Set<string>();
  const nodeIds = new Set<string>();
  
  // Maps to store references for validation
  const nodeMap = new Map<string, any>();
  const styleReferences = new Map<string, string[]>();
  const variableReferences = new Map<string, string[]>();
  const componentReferences = new Map<string, string[]>();
  const componentToSetMap = new Map<string, string>(); // Maps components to their parent component sets
  
  // Process node hierarchy to collect statistics and validate references
  function processNode(node: any, parentPath: string[] = []): void {
    // Check for cycle detection by keeping track of node path
    const nodePath = [...parentPath, node.id];
    if (parentPath.includes(node.id)) {
      const cycleMessage = `Circular reference detected: ${nodePath.join(' -> ')}`;
      console.warn(cycleMessage);
      structuredData.metadata.validationIssues.push({
        type: 'error',
        message: cycleMessage,
        location: nodePath
      });
      structuredData.metadata.validationStatus = 'invalid';
      return; // Stop processing this branch to prevent infinite recursion
    }
    
    // Track node ID and increment count
    structuredData.metadata.statistics.totalNodes++;
    nodeIds.add(node.id);
    nodeMap.set(node.id, node);
    
    // Process styles
    if (node.styleReferences) {
      for (const styleType in node.styleReferences) {
        const styleId = node.styleReferences[styleType];
        styleIds.add(styleId);
        
        // Store the style in the styles dictionary if not already present
        if (!structuredData.design.styles[styleId]) {
          // Try to get the actual style information from Figma
          try {
            const style = figma.getStyleById(styleId);
            if (style) {
              const styleEntry: any = {
                id: style.id,
                name: style.name,
                type: style.type,
                description: style.description || null
              };
              
              // Extract type-specific style properties
              if (style.type === 'TEXT') {
                try {
                  // For text styles, we need to find a node using this style to get properties
                  // This is because Figma doesn't expose text style properties directly
                  const nodesWithStyle = figma.currentPage.findAll(node => {
                    return 'textStyleId' in node && node.textStyleId === styleId;
                  });
                  
                  if (nodesWithStyle.length > 0) {
                    const textNode = nodesWithStyle[0] as TextNode;
                    styleEntry.fontName = textNode.fontName;
                    styleEntry.fontSize = textNode.fontSize;
                    styleEntry.letterSpacing = textNode.letterSpacing;
                    styleEntry.lineHeight = textNode.lineHeight;
                    styleEntry.textCase = textNode.textCase;
                    styleEntry.textDecoration = textNode.textDecoration;
                    styleEntry.paragraphIndent = textNode.paragraphIndent;
                    styleEntry.paragraphSpacing = textNode.paragraphSpacing;
                    styleEntry.textAlignHorizontal = textNode.textAlignHorizontal;
                    styleEntry.textAlignVertical = textNode.textAlignVertical;
                  } else {
                    console.warn(`Couldn't find a node using text style: ${style.name}`);
                  }
                } catch (textStyleError: unknown) {
                  console.warn(`Error extracting text style properties:`, textStyleError);
                }
              } 
              else if (style.type === 'PAINT') {
                try {
                  // For paint styles, we need to find a node using this style to get properties
                  const nodesWithStyle = figma.currentPage.findAll(node => {
                    return 'fillStyleId' in node && node.fillStyleId === styleId;
                  });
                  
                  if (nodesWithStyle.length > 0) {
                    const node = nodesWithStyle[0] as SceneNode;
                    if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
                      styleEntry.fills = node.fills;
                    }
                  } else {
                    console.warn(`Couldn't find a node using paint style`);
                  }
                } catch (paintStyleError: unknown) {
                  console.warn(`Error extracting paint style properties:`, paintStyleError);
                }
              }
              else if (style.type === 'EFFECT') {
                try {
                  const nodesWithStyle = figma.currentPage.findAll(node => {
                    return 'effectStyleId' in node && node.effectStyleId === styleId;
                  });
                  
                  if (nodesWithStyle.length > 0) {
                    const node = nodesWithStyle[0] as SceneNode;
                    if ('effects' in node && Array.isArray(node.effects) && node.effects.length > 0) {
                      styleEntry.effects = node.effects;
                    }
                  } else {
                    console.warn(`Couldn't find a node using effect style`);
                  }
                } catch (effectStyleError: unknown) {
                  console.warn(`Error extracting effect style properties:`, effectStyleError);
                }
              }
              else if (String(style.type) === 'STROKE') {
                try {
                  const nodesWithStyle = figma.currentPage.findAll(node => {
                    return 'strokeStyleId' in node && node.strokeStyleId === styleId;
                  });
                  
                  if (nodesWithStyle.length > 0) {
                    const node = nodesWithStyle[0] as SceneNode;
                    if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
                      styleEntry.strokes = node.strokes;
                      if ('strokeWeight' in node) styleEntry.strokeWeight = node.strokeWeight;
                      if ('strokeAlign' in node) styleEntry.strokeAlign = node.strokeAlign;
                      if ('strokeCap' in node) styleEntry.strokeCap = node.strokeCap;
                      if ('strokeJoin' in node) styleEntry.strokeJoin = node.strokeJoin;
                      if ('strokeMiterLimit' in node) styleEntry.strokeMiterLimit = node.strokeMiterLimit;
                    }
                  } else {
                    console.warn(`Couldn't find a node using stroke style`);
                  }
                } catch (strokeStyleError: unknown) {
                  console.warn(`Error extracting stroke style properties:`, strokeStyleError);
                }
              }
              else if (String(style.type) === 'GRID') {
                try {
                  const nodesWithStyle = figma.currentPage.findAll(node => {
                    return 'gridStyleId' in node && node.gridStyleId === styleId;
                  });
                  
                  if (nodesWithStyle.length > 0) {
                    const node = nodesWithStyle[0] as FrameNode | ComponentNode | InstanceNode;
                    if ('layoutGrids' in node && Array.isArray(node.layoutGrids) && node.layoutGrids.length > 0) {
                      styleEntry.layoutGrids = node.layoutGrids;
                    }
                  } else {
                    console.warn(`Couldn't find a node using grid style`);
                  }
                } catch (gridStyleError: unknown) {
                  console.warn(`Error extracting grid style properties:`, gridStyleError);
                }
              }
              
              structuredData.design.styles[styleId] = styleEntry;
            } else {
              // Fallback if style not found
              structuredData.design.styles[styleId] = {
                id: styleId,
                type: styleType,
                name: `Style ${styleId}`
              };
            }
          } catch (error) {
            // Fallback if error occurs
            structuredData.design.styles[styleId] = {
              id: styleId,
              type: styleType,
              name: `Style ${styleId}`
            };
          }
          
          // Update style statistics
          structuredData.metadata.statistics.styles.total++;
          
          // Update type-specific style counts
          if (styleType === 'fill') structuredData.metadata.statistics.styles.fill++;
          else if (styleType === 'text') structuredData.metadata.statistics.styles.text++;
          else if (styleType === 'stroke') structuredData.metadata.statistics.styles.stroke++;
          else if (styleType === 'effect') structuredData.metadata.statistics.styles.effect++;
          else if (styleType === 'grid') structuredData.metadata.statistics.styles.grid++;
        }
        
        // Add reference from style to node
        styleReferences.set(styleId, [...(styleReferences.get(styleId) || []), node.id]);
      }
    }
    
    // Process variables
    if (node.variableReferences) {
      for (const prop in node.variableReferences) {
        const variableId = node.variableReferences[prop];
        variableIds.add(variableId);
        
        // Store the variable in the variables dictionary if not already present
        if (!structuredData.design.variables[variableId]) {
          // Try to get the actual variable info
          try {
            const variable = figma.variables.getVariableById(variableId);
            if (variable) {
              // Get collection info if possible
              let collectionName = null;
              let collectionModes = null;
              try {
                const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
                if (collection) {
                  collectionName = collection.name;
                  collectionModes = collection.modes;
                }
              } catch (collectionError) {
                // Ignore collection errors
              }
              
              // Get the variable value for each mode
              let valuesByMode: Record<string, any> = {};
              try {
                if (collectionModes && collectionModes.length > 0) {
                  for (const mode of collectionModes) {
                    try {
                      const value = variable.valuesByMode[mode.modeId];
                      if (value !== undefined) {
                        valuesByMode[mode.name] = {
                          modeId: mode.modeId,
                          value: value
                        };
                        
                        // For alias variables, try to resolve the reference
                        if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'VARIABLE_ALIAS') {
                          try {
                            const aliasVariable = figma.variables.getVariableById(value.id);
                            if (aliasVariable) {
                              valuesByMode[mode.name].resolvedVariable = {
                                id: aliasVariable.id,
                                name: aliasVariable.name,
                                resolvedType: aliasVariable.resolvedType
                              };
                            }
                          } catch (aliasError) {
                            // Ignore alias resolution errors
                          }
                        }
                      }
                    } catch (modeError) {
                      // Skip this mode if there's an error
                    }
                  }
                }
              } catch (valueError) {
                // Ignore value extraction errors
              }
              
              structuredData.design.variables[variableId] = {
                id: variable.id,
                name: variable.name,
                type: variable.resolvedType,
                collectionName: collectionName,
                collectionId: variable.variableCollectionId,
                valuesByMode: valuesByMode,
                key: variable.key
              };
            } else {
              // Fallback
              structuredData.design.variables[variableId] = {
                id: variableId,
                name: `Variable ${variableId}`,
                type: 'unknown'
              };
            }
          } catch (error) {
            // Fallback
            structuredData.design.variables[variableId] = {
              id: variableId,
              name: `Variable ${variableId}`,
              type: 'unknown'
            };
          }
          
          // Update variable statistics
          structuredData.metadata.statistics.variables.total++;
          
          // Update type-specific variable counts (will be updated when we have actual type data)
          const variableType = 'unknown';
          structuredData.metadata.statistics.variables.byType[variableType] = 
            (structuredData.metadata.statistics.variables.byType[variableType] || 0) + 1;
        }
        
        // Add reference from variable to node
        variableReferences.set(variableId, [...(variableReferences.get(variableId) || []), node.id]);
        
        // Store the property mapping in the node
        if (!nodeMap.get(node.id).variableMappings) {
          nodeMap.get(node.id).variableMappings = {};
        }
        nodeMap.get(node.id).variableMappings[prop] = variableId;
      }
    }
    
    // Process component instances, definitions, and sets
    if (node.componentReferences) {
      // First pass: Register all components and component sets
      for (const refType in node.componentReferences) {
        const refId = node.componentReferences[refType];
        
        // Handle different reference types
        if (refType === 'mainComponent') {
          // This is an instance of a component
          if (!structuredData.design.components[refId]) {
            // Try to get actual component info
            try {
              let name = `Component ${refId}`;
              let description = null;
              
              // If we have the node in our node map, we can get direct info
              if (nodeMap.has(refId)) {
                const node = nodeMap.get(refId);
                name = node.name;
                description = node.description || null;
              }
              // Otherwise try to get it from the mainComponent reference if it's an instance
              else if (refType === 'mainComponent' && node.type === 'INSTANCE') {
                const instance = node as InstanceNode;
                if (instance.mainComponent) {
                  name = instance.mainComponent.name;
                  description = (instance.mainComponent as ComponentNode).description || null;
                }
              }
              
              structuredData.design.components[refId] = {
                id: refId,
                type: 'COMPONENT',
                name: name,
                description: description,
                instances: [] // Will store IDs of instances of this component
              };
            } catch (error) {
              // Fallback
              structuredData.design.components[refId] = {
                id: refId,
                type: 'COMPONENT',
                name: `Component ${refId}`,
                instances: []
              };
            }
            
            // Update statistics
            structuredData.metadata.statistics.components.instances++;
            if (!componentIds.has(refId)) {
              componentIds.add(refId);
              structuredData.metadata.statistics.components.total++;
            }
            
            // Track references
            componentReferences.set(refId, [...(componentReferences.get(refId) || []), node.id]);
          }
        }
        else if (refType === 'componentDefinition') {
          // This is a component definition
          if (!structuredData.design.components[refId]) {
            structuredData.design.components[refId] = {
              id: refId,
              type: 'COMPONENT',
              name: `Component ${refId}`
            };
          }
          
          // Update statistics
          structuredData.metadata.statistics.components.mainComponents++;
          if (!componentIds.has(refId)) {
            componentIds.add(refId);
            structuredData.metadata.statistics.components.total++;
          }
          
          // Track references
          componentReferences.set(refId, [...(componentReferences.get(refId) || []), node.id]);
        }
        else if (refType === 'componentSet' || refType === 'componentSetDefinition') {
          // This is a component set
          if (!structuredData.design.componentSets[refId]) {
            // Try to get actual component set info
            try {
              let name = `Component Set ${refId}`;
              
              // If we have the node in our node map, we can get direct info
              if (nodeMap.has(refId)) {
                const node = nodeMap.get(refId);
                name = node.name;
              }
              // Otherwise try to get name from parent if it's a component
              else if (node.type === 'COMPONENT') {
                // Use optional chaining to safely access parent properties
                const componentNode = node as ComponentNode;
                const parentType = componentNode.parent?.type;
                if (parentType === 'COMPONENT_SET') {
                  name = componentNode.parent?.name ?? `Component Set ${refId}`;
                }
              }
              
              structuredData.design.componentSets[refId] = {
                id: refId,
                type: 'COMPONENT_SET',
                name: name,
                variants: [] // Will store IDs of variants in this set
              };
            } catch (error) {
              // Fallback
              structuredData.design.componentSets[refId] = {
                id: refId,
                type: 'COMPONENT_SET',
                name: `Component Set ${refId}`,
                variants: []
              };
            }
            
            // Update statistics
            structuredData.metadata.statistics.components.componentSets++;
            if (!componentSetIds.has(refId)) {
              componentSetIds.add(refId);
            }
          }
        }
      }
      
      // Second pass: Handle relationships between components and component sets
      // Component to component set relationships
      if (node.componentReferences.componentSet) {
        const componentId = node.id;
        const componentSetId = node.componentReferences.componentSet;
        
        // Link the component to its parent component set
        if (structuredData.design.components[componentId]) {
          structuredData.design.components[componentId].componentSetId = componentSetId;
        }
        
        // Add the component as a variant in the component set
        if (structuredData.design.componentSets[componentSetId] && 
            !structuredData.design.componentSets[componentSetId].variants.includes(componentId)) {
          structuredData.design.componentSets[componentSetId].variants.push(componentId);
        }
        
        // Update the map for quick lookup
        componentToSetMap.set(componentId, componentSetId);
      }
      
      // Handle variant components within a component set
      if (node.componentReferences.variants && Array.isArray(node.componentReferences.variants)) {
        const componentSetId = node.id;
        
        for (const variantId of node.componentReferences.variants) {
          // Register the variant component if not already done
          if (!structuredData.design.components[variantId]) {
            structuredData.design.components[variantId] = {
              id: variantId,
              type: 'COMPONENT',
              name: `Variant ${variantId}`,
              componentSetId: componentSetId // Link to parent component set
            };
            
            // Update statistics
            structuredData.metadata.statistics.components.mainComponents++;
            if (!componentIds.has(variantId)) {
              componentIds.add(variantId);
              structuredData.metadata.statistics.components.total++;
            }
          }
          
          // Add the variant to the component set's variants list if not already there
          if (structuredData.design.componentSets[componentSetId] && 
              !structuredData.design.componentSets[componentSetId].variants.includes(variantId)) {
            structuredData.design.componentSets[componentSetId].variants.push(variantId);
          }
          
          // Update the map for quick lookup
          componentToSetMap.set(variantId, componentSetId);
        }
      }
      
      // Add component properties and variant properties to the node
      if (node.componentProperties) {
        if (structuredData.design.components[node.id]) {
          structuredData.design.components[node.id].properties = node.componentProperties;
        }
      }
      
      if (node.variantProperties) {
        if (structuredData.design.components[node.id]) {
          structuredData.design.components[node.id].variantProperties = node.variantProperties;
        }
      }
      
      // Add variant group properties to component sets
      if (node.variantGroupProperties) {
        if (structuredData.design.componentSets[node.id]) {
          structuredData.design.componentSets[node.id].variantGroupProperties = node.variantGroupProperties;
        }
      }
    }
    
    // Process children recursively
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        processNode(child, nodePath);
      }
    }
  }
  
  // Start processing from the root node
  processNode(extractedData);
  
  // Update summary statistics
  structuredData.metadata.statistics.styles.total = styleIds.size;
  structuredData.metadata.statistics.variables.total = variableIds.size;
  structuredData.metadata.statistics.components.total = componentIds.size;
  
  // Add component set reference to each component
  for (const [componentId, componentSetId] of componentToSetMap.entries()) {
    if (structuredData.design.components[componentId]) {
      structuredData.design.components[componentId].componentSetId = componentSetId;
    }
  }
  
  // Validate that all references point to valid objects
  function validateReferences(): void {
    console.log('Validating references...');
    
    // Validate style references
    for (const [styleId, nodeRefs] of styleReferences.entries()) {
      if (!structuredData.design.styles[styleId]) {
        const message = `Style reference issue: Style ID ${styleId} is referenced but not found in styles`;
        console.warn(message);
        structuredData.metadata.validationIssues.push({
          type: 'warning',
          message,
          styleId,
          referencedBy: nodeRefs
        });
      }
    }
    
    // Validate variable references
    for (const [variableId, nodeRefs] of variableReferences.entries()) {
      if (!structuredData.design.variables[variableId]) {
        const message = `Variable reference issue: Variable ID ${variableId} is referenced but not found in variables`;
        console.warn(message);
        structuredData.metadata.validationIssues.push({
          type: 'warning',
          message,
          variableId,
          referencedBy: nodeRefs
        });
      }
    }
    
    // Validate component references
    for (const [componentId, nodeRefs] of componentReferences.entries()) {
      if (!structuredData.design.components[componentId]) {
        const message = `Component reference issue: Component ID ${componentId} is referenced but not found in components`;
        console.warn(message);
        structuredData.metadata.validationIssues.push({
          type: 'warning',
          message,
          componentId,
          referencedBy: nodeRefs
        });
      }
    }
    
    // Validate component to component set references
    for (const [componentId, componentSetId] of componentToSetMap.entries()) {
      if (!structuredData.design.componentSets[componentSetId]) {
        const message = `Component set reference issue: Component Set ID ${componentSetId} is referenced by component ${componentId} but not found in component sets`;
        console.warn(message);
        structuredData.metadata.validationIssues.push({
          type: 'warning',
          message,
          componentId,
          componentSetId
        });
      }
    }
  }
  
  // Run validation
  validateReferences();
  
  // Set overall validation status
  if (structuredData.metadata.validationIssues.length > 0) {
    const errorCount = structuredData.metadata.validationIssues.filter((issue: {type: string}) => issue.type === 'error').length;
    const warningCount = structuredData.metadata.validationIssues.filter((issue: {type: string}) => issue.type === 'warning').length;
    
    if (errorCount > 0) {
      structuredData.metadata.validationStatus = 'invalid';
    } else if (warningCount > 0) {
      structuredData.metadata.validationStatus = 'warning';
    }
    
    console.log(`Validation complete with ${errorCount} errors and ${warningCount} warnings.`);
  } else {
    console.log('Validation complete: No issues found.');
  }
  
  return structuredData;
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
        
        // Structure and validate the extracted data
        const structuredData = structureAndValidateData(extractedData);
        
        const nodeJson = JSON.stringify(structuredData, null, 2);
        
        console.log('Sending extraction complete message to UI');
        // In a real implementation, this would export an actual PNG/JPG
        // Here we just notify that we would need to export it
        figma.ui.postMessage({
          type: 'extraction-complete',
          data: {
            json: nodeJson,
            name: selectedNode.name,
            stats: structuredData.metadata.statistics,
            validationStatus: structuredData.metadata.validationStatus,
            validationIssues: structuredData.metadata.validationIssues
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

// Add this function to get component structure with controlled recursion
function extractComponentStructure(component: ComponentNode | InstanceNode, depth: number = 0): any {
  // Skip if already processed or max depth reached
  if (processedComponentIds.has(component.id) || depth > MAX_EXTRACTION_DEPTH) {
    return {
      id: component.id,
      name: component.name,
      type: component.type,
      reference: true  // Flag to indicate this is just a reference
    };
  }
  
  // Mark as processed to avoid cycles
  processedComponentIds.add(component.id);
  
  try {
    // Only log at certain depths to reduce console noise for deep hierarchies
    if (depth <= 1 || depth % 2 === 0) {
      console.log(`[extractComponentStructure] Processing ${component.type} "${component.name}" at depth ${depth}`);
    }
    
    // Extract the basic structure using your existing extractNodeData function
    const structure = extractNodeData(component, depth);
    
    // Add any component-specific properties
    if (component.type === 'COMPONENT') {
      const componentNode = component as ComponentNode;
      structure.description = componentNode.description || null;
      
      // Add documentation links if they exist
      if (componentNode.documentationLinks && componentNode.documentationLinks.length > 0) {
        structure.documentationLinks = componentNode.documentationLinks;
      }
      
      // Get any published name (different from internal name)
      if ('publishedName' in componentNode) {
        structure.publishedName = componentNode.publishedName;
      }
    }
    
    return structure;
  } catch (error: unknown) {
    console.warn(`[extractComponentStructure] Error extracting structure for ${component.type} "${component.name}":`, error);
    
    // Return a minimal safe structure on error
    return {
      id: component.id,
      name: component.name,
      type: component.type,
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error during structure extraction'
    };
  }
} 