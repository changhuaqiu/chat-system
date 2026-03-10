import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-bg-primary text-white font-pixel-body overflow-hidden relative">
      {/* 像素图案背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none pixel-pattern-bg opacity-30"></div>

      {/* 扫描线效果层 */}
      <div className="fixed inset-0 bg-bg-primary/50 pointer-events-none"
           style={{
             background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)'
           }}>
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 flex h-full w-full">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
