import React, { useState } from 'react';
import './ImagePreview.css';

interface ImagePreviewProps {
  imageUrl: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="image-preview">
      {loading && (
        <div className="loading-indicator">
          <p>Loading image...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>Failed to load image</p>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt="Design Preview"
        className={`preview-image ${loading ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ImagePreview; 