import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-bg text-white font-sans overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape w-96 h-96 bg-purple-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="floating-shape w-80 h-80 bg-blue-500 top-1/2 right-0 translate-x-1/3"></div>
        <div className="floating-shape w-72 h-72 bg-pink-500 bottom-0 left-1/3"></div>
      </div>

      {/* 玻璃态背景层 */}
      <div className="fixed inset-0 bg-glass backdrop-blur-glass pointer-events-none"></div>

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
