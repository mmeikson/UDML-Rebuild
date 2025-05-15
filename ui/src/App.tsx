import React, { useState } from 'react';
import XmlViewer from './components/XmlViewer';
import ImagePreview from './components/ImagePreview';
import './App.css';

function App() {
  const [xmlData, setXmlData] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>UDML Viewer</h1>
        <p>View Figma designs converted to User Design Markup Language</p>
      </header>
      
      <main className="app-content">
        <div className="content-container">
          {imageData ? (
            <div className="preview-container">
              <h2>Design Preview</h2>
              <ImagePreview imageUrl={imageData} />
            </div>
          ) : (
            <div className="empty-state">
              <h2>No Design Loaded</h2>
              <p>Extract a design from Figma using the UDML plugin</p>
            </div>
          )}
          
          <div className="xml-container">
            <h2>UDML XML</h2>
            {xmlData ? (
              <XmlViewer xmlContent={xmlData} />
            ) : (
              <div className="empty-xml">
                <p>No XML data available</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>UDML - User Design Markup Language</p>
      </footer>
    </div>
  );
}

export default App; 