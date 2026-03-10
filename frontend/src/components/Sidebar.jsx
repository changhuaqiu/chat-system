import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/chat', label: '聊天室', icon: '💬' },
    { path: '/logs', label: '日志', icon: '📈' },
    { path: '/robots', label: '机器人', icon: '🤖' },
    { path: '/api-keys', label: 'API 密钥', icon: '🔑' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <aside
      className={`
        bg-bg-secondary border-r-4 border-border flex flex-col flex-shrink-0 h-screen font-pixel-body relative
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-8 bg-bg-secondary border-4 border-border w-8 h-8 flex items-center justify-center z-10 hover:bg-pixel-gray-dark transition-colors"
      >
        <span className="text-xs text-white block w-4 h-4 flex items-center justify-center font-pixel-title">
          {collapsed ? '>' : '<'}
        </span>
      </button>

      <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden">
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} mb-8`}>
          <div className="w-12 h-12 bg-pixel-primary border-4 border-pixel-primary-dark flex items-center justify-center shadow-pixel-md flex-shrink-0">
            <span className="text-white text-xl">🤖</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-pixel-title text-sm text-white whitespace-nowrap leading-relaxed">OpenClaw</h1>
              <p className="text-xs text-pixel-gray font-pixel-body whitespace-nowrap">控制中心</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center ${collapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-3 cursor-pointer transition-colors border-4
                  ${isActive
                    ? 'bg-pixel-primary border-pixel-primary-dark text-white shadow-pixel-sm'
                    : 'border-transparent text-white hover:bg-bg-card hover:border-border'}
                `}
                title={collapsed ? item.label : ''}
              >
                <span className={`text-xl ${isActive ? 'text-white' : 'text-pixel-gray'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-pixel-body text-base whitespace-nowrap">{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Info */}
      <div className="p-4 border-t-4 border-border">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-2 py-2 hover:bg-bg-card cursor-pointer transition-colors`}>
          <div className="w-10 h-10 bg-pixel-gray-dark border-4 border-border flex items-center justify-center text-white text-sm font-pixel-title flex-shrink-0">
            KK
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-pixel-body truncate">管理员</p>
              <p className="text-xs text-pixel-gray font-pixel-body truncate">admin@openclaw.ai</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
