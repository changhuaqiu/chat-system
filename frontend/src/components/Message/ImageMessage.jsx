import React, { useState } from 'react';

/**
 * 图片消息组件 - 像素风格
 */
const ImageMessage = ({ url, alt }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="cursor-pointer overflow-hidden border-4 border-border"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={url}
          alt={alt || "Image"}
          className="max-w-full h-auto max-h-[300px] object-cover hover:opacity-90 transition-opacity"
          style={{ imageRendering: 'pixelated' }}
          loading="lazy"
        />
      </div>

      {/* Lightbox Modal - 像素风格 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-pixel-accent-cyan p-2 border-4 border-white/20 hover:border-pixel-accent-cyan"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <img
            src={url}
            alt={alt || "Full size"}
            className="max-w-full max-h-full object-contain border-8 border-border"
            style={{ imageRendering: 'pixelated' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImageMessage;
