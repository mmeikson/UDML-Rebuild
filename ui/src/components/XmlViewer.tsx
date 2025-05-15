import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './XmlViewer.css';

interface XmlViewerProps {
  xmlContent: string;
}

const XmlViewer: React.FC<XmlViewerProps> = ({ xmlContent }) => {
  return (
    <div className="xml-viewer">
      <SyntaxHighlighter
        language="xml"
        style={atomDark}
        showLineNumbers
        wrapLines
        customStyle={{
          borderRadius: '4px',
          fontSize: '14px',
          margin: 0,
          maxHeight: '500px',
          overflow: 'auto'
        }}
      >
        {xmlContent}
      </SyntaxHighlighter>
    </div>
  );
};

export default XmlViewer; 