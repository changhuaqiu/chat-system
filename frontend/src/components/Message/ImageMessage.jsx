import React, { useState } from 'react';

const ImageMessage = ({ url, alt }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={url} 
          alt={alt || "Image"} 
          className="max-w-full h-auto max-h-[300px] object-cover hover:opacity-90 transition-opacity"
          loading="lazy"
        />
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <img 
            src={url} 
            alt={alt || "Full size"} 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImageMessage;
