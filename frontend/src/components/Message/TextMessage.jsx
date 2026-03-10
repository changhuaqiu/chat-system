import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TextMessage = ({ content }) => {
  return (
    <div className="markdown-body text-sm leading-relaxed font-pixel-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} bg-bg-input px-1 py-0.5 text-xs font-mono border-2 border-border`} {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-pixel-accent-cyan hover:text-pixel-accent-pink transition-colors">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 ml-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 ml-2">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-pixel-accent-purple pl-4 italic text-pixel-gray my-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default TextMessage;
