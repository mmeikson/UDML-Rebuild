// This is the main entry point for the Figma plugin UI
// It runs in an iframe within the Figma plugin window

console.log('UI loaded');

// Initialize UI with visible feedback
function initUI() {
  console.log('Initializing UI...');
  
  // Check if DOM is ready
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', setupUI);
  } else {
    setupUI();
  }
}

// Setup UI elements and event handlers
function setupUI() {
  console.log('Setting up UI elements...');
  
  // First try to show some visible status
  try {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = '🔍 UI script running...';
      statusElement.style.color = '#18A0FB';
    } else {
      console.error('Status element not found in DOM!');
    }
  } catch (err: any) {
    console.error('Error updating status:', err);
  }

  try {
    // DOM elements
    const extractButton = document.getElementById('extract') as HTMLButtonElement;
    const cancelButton = document.getElementById('cancel') as HTMLButtonElement;
    const statusDiv = document.getElementById('status') as HTMLDivElement;
    const errorDiv = document.getElementById('error') as HTMLDivElement;
    const frameDetailsDiv = document.getElementById('frame-details') as HTMLDivElement;
    const spinnerDiv = document.getElementById('spinner') as HTMLDivElement;
    
    // Create a results container for showing the JSON preview
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-container';
    resultsContainer.style.display = 'none';
    resultsContainer.style.marginTop = '16px';
    resultsContainer.style.width = '100%';
    resultsContainer.style.overflow = 'hidden';
    resultsContainer.style.borderRadius = '6px';
    resultsContainer.style.border = '1px solid #ddd';
    
    // Find container to add our UI elements
    const container = document.querySelector('.container');
    if (container) {
      container.appendChild(resultsContainer);
    } else {
      document.body.appendChild(resultsContainer);
    }
    
    // Create results header
    const resultsHeader = document.createElement('div');
    resultsHeader.style.padding = '10px 12px';
    resultsHeader.style.fontWeight = 'bold';
    resultsHeader.style.borderBottom = '1px solid #ddd';
    resultsHeader.style.display = 'flex';
    resultsHeader.style.justifyContent = 'space-between';
    resultsHeader.style.alignItems = 'center';
    resultsHeader.style.backgroundColor = 'var(--color-frame-bg)';
    resultsHeader.textContent = 'Extracted JSON Data';
    resultsContainer.appendChild(resultsHeader);
    
    // Create download button for the header
    const headerDownloadButton = document.createElement('button');
    headerDownloadButton.textContent = 'Download JSON';
    headerDownloadButton.style.display = 'none';
    headerDownloadButton.style.fontSize = '12px';
    headerDownloadButton.style.padding = '4px 8px';
    resultsHeader.appendChild(headerDownloadButton);
    
    // Create JSON data container for showing the extracted data
    const jsonDataContainer = document.createElement('pre');
    jsonDataContainer.id = 'json-data';
    jsonDataContainer.style.maxHeight = '250px';
    jsonDataContainer.style.overflow = 'auto';
    jsonDataContainer.style.margin = '0';
    jsonDataContainer.style.padding = '12px';
    jsonDataContainer.style.fontSize = '12px';
    jsonDataContainer.style.fontFamily = 'monospace';
    jsonDataContainer.style.backgroundColor = 'var(--color-frame-bg)';
    resultsContainer.appendChild(jsonDataContainer);
    
    // Create a post-extraction actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.style.display = 'none';
    actionsContainer.style.marginTop = '16px';
    actionsContainer.style.textAlign = 'center';
    
    // Add the actions container to the DOM - either to main container or body
    if (container) {
      container.appendChild(actionsContainer);
    } else {
      document.body.appendChild(actionsContainer);
    }
    
    // Create main download button
    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-json';
    downloadButton.textContent = '💾 Download JSON';
    downloadButton.style.display = 'none';
    downloadButton.style.padding = '8px 16px';
    downloadButton.style.marginRight = '8px';
    downloadButton.style.backgroundColor = '#18A0FB';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '6px';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.fontWeight = 'bold';
    actionsContainer.appendChild(downloadButton);
    
    // Create a "done" button to close the plugin
    const doneButton = document.createElement('button');
    doneButton.textContent = '✓ Done';
    doneButton.style.display = 'none';
    doneButton.style.padding = '8px 16px';
    doneButton.style.backgroundColor = '#4CAF50';
    doneButton.style.color = 'white';
    doneButton.style.border = 'none';
    doneButton.style.borderRadius = '6px';
    doneButton.style.cursor = 'pointer';
    doneButton.style.fontWeight = 'bold';
    actionsContainer.appendChild(doneButton);
    
    if (!extractButton || !cancelButton || !statusDiv || !errorDiv || !frameDetailsDiv || !spinnerDiv) {
      console.error('Some UI elements not found!', {
        extractButton: !!extractButton,
        cancelButton: !!cancelButton,
        statusDiv: !!statusDiv,
        errorDiv: !!errorDiv,
        frameDetailsDiv: !!frameDetailsDiv,
        spinnerDiv: !!spinnerDiv
      });
      return;
    }

    let currentSelection: any = null;
    let extractedJson: string | null = null;
    let extractedName: string | null = null;

    // Show/hide spinner
    const showSpinner = (show: boolean) => {
      spinnerDiv.style.display = show ? 'block' : 'none';
    };

    // Show status message (success)
    const showStatus = (message: string) => {
      statusDiv.textContent = `✔️ ${message}`;
      statusDiv.style.color = '#18A0FB';
      errorDiv.textContent = '';
      showSpinner(false);
      // Also log to console for debugging
      console.log('Status:', message);
    };

    // Show error message
    const showError = (message: string) => {
      errorDiv.textContent = `⚠️ ${message}`;
      statusDiv.textContent = '';
      showSpinner(false);
      // Also log to console for debugging
      console.error('Error:', message);
    };

    // Configure download button functionality
    const setupDownloadButton = (json: string, name: string) => {
      const downloadFunction = () => {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '-').toLowerCase()}-extracted.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus(`Downloading JSON for "${name}"`);
      };
      
      // Set the same function for both download buttons
      downloadButton.onclick = downloadFunction;
      headerDownloadButton.onclick = downloadFunction;
      
      // Show the download buttons
      downloadButton.style.display = 'inline-block';
      headerDownloadButton.style.display = 'inline-block';
      doneButton.style.display = 'inline-block';
      actionsContainer.style.display = 'block';
    };

    // Display JSON preview
    const displayJsonPreview = (json: string, name: string) => {
      try {
        // Parse and re-stringify to format nicely
        const parsedData = JSON.parse(json);
        const previewText = JSON.stringify(parsedData, null, 2);
        
        // Truncate if too long
        const maxLength = 5000;
        const displayText = previewText.length > maxLength 
          ? previewText.substring(0, maxLength) + '...\n[Content truncated for preview]' 
          : previewText;
        
        // Display in the pre element
        if (jsonDataContainer) {
          jsonDataContainer.textContent = displayText;
          resultsContainer.style.display = 'block';
        }
        
        // Setup download functionality
        setupDownloadButton(json, name);
        
        // Hide extract button once data is extracted
        extractButton.style.display = 'none';
        
        // Setup done button
        doneButton.onclick = () => {
          parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
        };
      } catch (err) {
        console.error('Error displaying JSON preview:', err);
        if (jsonDataContainer) {
          jsonDataContainer.textContent = 'Error parsing JSON data';
        }
      }
    };

    // Update frame details UI
    const updateFrameDetails = (selection: any) => {
      if (!selection) {
        frameDetailsDiv.style.display = 'none';
        extractButton.disabled = true;
        showStatus('No valid frame selected. Please select a frame, component, or instance.');
        return;
      }
      frameDetailsDiv.style.display = 'block';
      frameDetailsDiv.innerHTML = `
        <strong>Selected:</strong> ${selection.name} <br/>
        <strong>Type:</strong> ${selection.type} <br/>
        <strong>Size:</strong> ${Math.round(selection.width)} × ${Math.round(selection.height)} px <br/>
        ${selection.parent ? `<strong>Parent:</strong> ${selection.parent}` : ''}
      `;
      extractButton.disabled = false;
      extractButton.style.display = 'inline-block';
      showStatus('Ready to extract the selected frame.');
    };

    // Reset the UI state
    const resetUI = () => {
      if (resultsContainer) {
        resultsContainer.style.display = 'none';
      }
      if (jsonDataContainer) {
        jsonDataContainer.textContent = '';
      }
      if (downloadButton) {
        downloadButton.style.display = 'none';
      }
      if (headerDownloadButton) {
        headerDownloadButton.style.display = 'none';
      }
      if (doneButton) {
        doneButton.style.display = 'none';
      }
      if (actionsContainer) {
        actionsContainer.style.display = 'none';
      }
      if (extractButton) {
        extractButton.style.display = 'inline-block';
      }
      extractedJson = null;
      extractedName = null;
    };

    // Message handler for communication from the plugin code
    window.onmessage = (event) => {
      console.log('MESSAGE RECEIVED:', event.data);
      const message = event.data.pluginMessage;
      if (!message) {
        console.log('No pluginMessage in event data');
        return;
      }
      
      console.log('Processing message type:', message.type);
      showStatus(`Received message: ${message.type}`);
      
      switch (message.type) {
        case 'plugin-ready':
          showStatus('Plugin ready. Select a frame and click "Extract".');
          showSpinner(false);
          resetUI();
          break;
        case 'selection-update':
          showStatus(`Selection update received: ${message.selection ? message.selection.name : 'None'}`);
          currentSelection = message.selection;
          updateFrameDetails(currentSelection);
          showSpinner(false);
          break;
        case 'extraction-complete':
          showSpinner(false);
          showStatus(`Extraction complete for "${message.data.name}". Processing...`);
          console.log('Extracted data received:', message.data);
          
          // Store the extracted data
          extractedJson = message.data.json;
          extractedName = message.data.name;
          
          // Display the JSON preview
          if (extractedJson && extractedName) {
            displayJsonPreview(extractedJson, extractedName);
            showStatus(`Data extracted successfully from "${extractedName}"! You can now download the JSON.`);
          } else {
            showError('Extracted data incomplete');
          }
          break;
        case 'error':
          showError(message.message);
          break;
        default:
          console.log('Unknown message type:', message.type);
          showStatus(`Unknown message type: ${message.type}`);
      }
    };

    // Button event listeners
    extractButton.addEventListener('click', () => {
      console.log('Extract button clicked');
      showStatus('Extract button clicked');
      if (!currentSelection) {
        showError('No valid frame selected.');
        return;
      }
      showSpinner(true);
      showStatus('Extracting data...');
      resetUI();
      parent.postMessage({ pluginMessage: { type: 'extract-frame' } }, '*');
    });

    cancelButton.addEventListener('click', () => {
      showStatus('Cancel button clicked');
      parent.postMessage({ pluginMessage: { type: 'close' } }, '*');
    });
    
    // Show initial status
    showStatus('UI initialized and ready');
    console.log('UI setup complete');
  } catch (err: any) {
    console.error('Error in UI setup:', err);
    // Try to show error even if setup failed
    try {
      const errorElement = document.getElementById('error');
      if (errorElement) {
        errorElement.textContent = `⚠️ UI Error: ${err.message || String(err)}`;
        errorElement.style.color = '#D92B2B';
      }
    } catch (e) {
      // At this point we can't do much else
      console.error('Critical UI error:', e);
    }
  }
}

// Start initialization
initUI();

// Also run on window load to be extra safe
window.onload = () => {
  console.log('Window loaded event fired');
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = '🔄 Window loaded, checking setup...';
  }
}; 