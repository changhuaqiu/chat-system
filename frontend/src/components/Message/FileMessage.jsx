import React from 'react';

/**
 * 文件消息组件 - 像素风格
 */
const FileMessage = ({ fileName, fileSize, fileType, url }) => {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('zip') || type?.includes('compressed')) return '📦';
    if (type?.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="flex items-center p-3 bg-bg-card border-4 border-border max-w-sm hover:bg-bg-secondary transition-colors">
      <div className="text-2xl mr-3">{getIcon(fileType)}</div>
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-pixel-title text-white truncate" title={fileName}>
          {fileName}
        </p>
        <p className="text-xs text-pixel-gray font-pixel-body">
          {formatSize(fileSize)}
        </p>
      </div>
      <a
        href={url}
        download={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-pixel-primary hover:text-pixel-accent-cyan bg-bg-secondary border-4 border-border hover:border-pixel-primary transition-colors"
        title="Download"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
      </a>
    </div>
  );
};

export default FileMessage;
