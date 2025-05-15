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
 * Extract comprehensive component information from a node
 * @param node The Figma node to extract component information from
 * @returns Object containing component data
 */
function extractComponentReferences(node: any): any {
  const componentData: any = {};
  
  try {
    // Handle INSTANCE nodes - extract main component, properties, and overrides
    if (node.type === 'INSTANCE') {
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
          // Use the same extraction logic we use for the main frame
          console.log(`🧩 Extracting complete structure of component: "${instance.mainComponent.name}"`);
          componentData.mainComponent.structure = extractNodeData(instance.mainComponent);
        } catch (structureError) {
          console.warn('Error extracting main component structure:', structureError);
        }
        
        // Extract component properties if available
        try {
          if ('componentProperties' in instance) {
            const properties = instance.componentProperties;
            if (properties && Object.keys(properties).length > 0) {
              console.log(`🧩 Found ${Object.keys(properties).length} component properties on instance "${node.name}"`);
              componentData.componentProperties = {};
              
              for (const property in properties) {
                const propDetails = properties[property];
                componentData.componentProperties[property] = {
                  type: propDetails.type,
                  value: propDetails.value
                };
              }
            }
          }
        } catch (propsError) {
          console.warn('Error extracting component properties:', propsError);
        }
        
        // Enhanced Component Set Extraction
        try {
          if (instance.mainComponent.parent) {
            // Check if parent is a component set
            if (instance.mainComponent.parent.type === 'COMPONENT_SET') {
              const componentSet = instance.mainComponent.parent as ComponentSetNode;
              console.log(`🧩 Found component set for instance "${node.name}": "${componentSet.name}"`);
              
              componentData.componentSet = {
                id: componentSet.id,
                name: componentSet.name,
                key: componentSet.key,
                isVariantSource: true
              };
              
              // Extract the complete component set structure
              try {
                console.log(`🧩 Extracting complete structure of component set: "${componentSet.name}"`);
                componentData.componentSet.structure = extractNodeData(componentSet);
              } catch (setStructureError) {
                console.warn('Error extracting component set structure:', setStructureError);
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
              componentData.componentSet.structure = extractNodeData(componentSet);
            } catch (setStructureError) {
              console.warn('Error extracting component set structure:', setStructureError);
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
              
              const variantInfo: any = {
                id: child.id,
                name: child.name,
                key: (child as ComponentNode).key
              };
              
              // Extract the complete variant structure
              try {
                console.log(`🧩 Extracting complete structure of variant: "${child.name}"`);
                variantInfo.structure = extractNodeData(child);
              } catch (variantStructureError) {
                console.warn('Error extracting variant structure:', variantStructureError);
              }
              
              // Get variant properties if available
              if ('variantProperties' in child) {
                variantInfo.properties = (child as ComponentNode).variantProperties;
              }
              
              componentData.variants.push(variantInfo);
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
  
  // Extract component information using the new function
  const componentRefs = extractComponentReferences(node);
  if (componentRefs) {
    nodeData.components = componentRefs;
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
    if (node.styles) {
      if (node.styles.fillStyle) {
        const styleId = node.styles.fillStyle.id;
        styleIds.add(styleId);
        structuredData.design.styles[styleId] = node.styles.fillStyle;
        structuredData.metadata.statistics.styles.fill++;
        styleReferences.set(styleId, [...(styleReferences.get(styleId) || []), node.id]);
      }
      if (node.styles.textStyle) {
        const styleId = node.styles.textStyle.id;
        styleIds.add(styleId);
        structuredData.design.styles[styleId] = node.styles.textStyle;
        structuredData.metadata.statistics.styles.text++;
        styleReferences.set(styleId, [...(styleReferences.get(styleId) || []), node.id]);
      }
      if (node.styles.strokeStyle) {
        const styleId = node.styles.strokeStyle.id;
        styleIds.add(styleId);
        structuredData.design.styles[styleId] = node.styles.strokeStyle;
        structuredData.metadata.statistics.styles.stroke++;
        styleReferences.set(styleId, [...(styleReferences.get(styleId) || []), node.id]);
      }
      if (node.styles.effectStyle) {
        const styleId = node.styles.effectStyle.id;
        styleIds.add(styleId);
        structuredData.design.styles[styleId] = node.styles.effectStyle;
        structuredData.metadata.statistics.styles.effect++;
        styleReferences.set(styleId, [...(styleReferences.get(styleId) || []), node.id]);
      }
      if (node.styles.gridStyle) {
        const styleId = node.styles.gridStyle.id;
        styleIds.add(styleId);
        structuredData.design.styles[styleId] = node.styles.gridStyle;
        structuredData.metadata.statistics.styles.grid++;
        styleReferences.set(styleId, [...(styleReferences.get(styleId) || []), node.id]);
      }
    }
    
    // Process variables
    if (node.variables && node.variables.boundVariables) {
      for (const prop in node.variables.boundVariables) {
        const variable = node.variables.boundVariables[prop];
        const variableId = variable.id;
        variableIds.add(variableId);
        structuredData.design.variables[variableId] = variable;
        
        // Track variable types for statistics
        const variableType = variable.resolvedType || 'unknown';
        structuredData.metadata.statistics.variables.byType[variableType] = 
          (structuredData.metadata.statistics.variables.byType[variableType] || 0) + 1;
        
        variableReferences.set(variableId, [...(variableReferences.get(variableId) || []), node.id]);
      }
    }
    
    // Process component instances, definitions, and sets
    if (node.components) {
      // Handle mainComponent reference (instances)
      if (node.components.mainComponent) {
        const componentId = node.components.mainComponent.id;
        componentIds.add(componentId);
        structuredData.design.components[componentId] = node.components.mainComponent;
        structuredData.metadata.statistics.components.instances++;
        componentReferences.set(componentId, [...(componentReferences.get(componentId) || []), node.id]);
        
        // Handle component set relationships for instances
        if (node.components.componentSet) {
          const componentSetId = node.components.componentSet.id;
          componentSetIds.add(componentSetId);
          
          // Add the component set to the dictionary if not already present
          if (!structuredData.design.componentSets[componentSetId]) {
            structuredData.design.componentSets[componentSetId] = {
              ...node.components.componentSet,
              variants: []
            };
            
            // Preserve the full component set structure if available
            if (node.components.componentSet.structure) {
              structuredData.design.componentSets[componentSetId].structure = 
                node.components.componentSet.structure;
            }
            
            structuredData.metadata.statistics.components.componentSets++;
          }
          
          // Link the component to its parent component set
          componentToSetMap.set(componentId, componentSetId);
          
          // Add variant information if available
          if (node.components.variantProperties) {
            structuredData.design.components[componentId].variantProperties = node.components.variantProperties;
          }
          
          // Add this component to the component set's variants list if not already present
          const existingVariants = structuredData.design.componentSets[componentSetId].variants || [];
          if (!existingVariants.some((v: any) => v.id === componentId)) {
            structuredData.design.componentSets[componentSetId].variants = [
              ...existingVariants,
              {
                id: componentId,
                name: node.components.mainComponent.name,
                variantProperties: node.components.variantProperties
              }
            ];
          }
        }
      }
      
      // Handle componentDefinition reference
      if (node.components.componentDefinition) {
        const componentId = node.components.componentDefinition.id;
        componentIds.add(componentId);
        structuredData.design.components[componentId] = node.components.componentDefinition;
        structuredData.metadata.statistics.components.mainComponents++;
        componentReferences.set(componentId, [...(componentReferences.get(componentId) || []), node.id]);
        
        // Handle component set relationships for component definitions
        if (node.components.componentSet) {
          const componentSetId = node.components.componentSet.id;
          componentSetIds.add(componentSetId);
          
          // Add the component set to the dictionary if not already present
          if (!structuredData.design.componentSets[componentSetId]) {
            structuredData.design.componentSets[componentSetId] = {
              ...node.components.componentSet,
              variants: []
            };
            
            // Preserve the full component set structure if available
            if (node.components.componentSet.structure) {
              structuredData.design.componentSets[componentSetId].structure = 
                node.components.componentSet.structure;
            }
            
            structuredData.metadata.statistics.components.componentSets++;
          }
          
          // Link the component to its parent component set
          componentToSetMap.set(componentId, componentSetId);
          
          // Add variant information if available
          if (node.components.variantProperties) {
            structuredData.design.components[componentId].variantProperties = node.components.variantProperties;
          }
          
          // Add this component to the component set's variants list if not already present
          const existingVariants = structuredData.design.componentSets[componentSetId].variants || [];
          if (!existingVariants.some((v: any) => v.id === componentId)) {
            structuredData.design.componentSets[componentSetId].variants = [
              ...existingVariants,
              {
                id: componentId,
                name: node.components.componentDefinition.name,
                variantProperties: node.components.variantProperties
              }
            ];
          }
        }
      }
      
      // Handle componentSetDefinition reference (component sets)
      if (node.components.componentSetDefinition) {
        const componentSetId = node.components.componentSetDefinition.id;
        componentSetIds.add(componentSetId);
        
        // Create or update the component set in the dictionary
        if (!structuredData.design.componentSets[componentSetId]) {
          structuredData.design.componentSets[componentSetId] = {
            ...node.components.componentSetDefinition,
            variants: []
          };
          structuredData.metadata.statistics.components.componentSets++;
        }
        
        // Add variant group properties if available
        if (node.components.variantGroupProperties) {
          structuredData.design.componentSets[componentSetId].variantGroupProperties = 
            node.components.variantGroupProperties;
        }
        
        // Add variant components from the component set definition
        if (node.components.variants && Array.isArray(node.components.variants)) {
          // For each variant, add it to the components dictionary and link to the component set
          node.components.variants.forEach((variant: any) => {
            const variantId = variant.id;
            componentIds.add(variantId);
            
            // Add the variant to the components dictionary
            if (!structuredData.design.components[variantId]) {
              structuredData.design.components[variantId] = {
                id: variantId,
                name: variant.name,
                key: variant.key,
                componentSetId: componentSetId // Reference back to the parent
              };
              
              // Preserve the full variant structure if available
              if (variant.structure) {
                structuredData.design.components[variantId].structure = variant.structure;
              }
              
              structuredData.metadata.statistics.components.mainComponents++;
            }
            
            // Add variant properties if available
            if (variant.properties) {
              structuredData.design.components[variantId].variantProperties = variant.properties;
            }
            
            // Link the component to its parent component set
            componentToSetMap.set(variantId, componentSetId);
            
            // Add to the component set's variants list if not already present
            const existingVariants = structuredData.design.componentSets[componentSetId].variants || [];
            if (!existingVariants.some((v: any) => v.id === variantId)) {
              structuredData.design.componentSets[componentSetId].variants = [
                ...existingVariants,
                {
                  id: variantId,
                  name: variant.name,
                  variantProperties: variant.properties
                }
              ];
            }
          });
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