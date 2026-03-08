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
        bg-white border-r border-[#e5e5e5] flex flex-col flex-shrink-0 h-screen font-apple transition-all duration-300 ease-in-out relative
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 bg-white border border-[#e5e5e5] rounded-full p-1 shadow-sm hover:bg-[#f5f5f7] z-10"
      >
        <span className="text-xs text-[#86868b] block w-4 h-4 flex items-center justify-center">
          {collapsed ? '›' : '‹'}
        </span>
      </button>

      <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`flex items-center space-x-3 mb-8 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#007aff] to-[#0055b3] flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-xl">🤖</span>
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-200">
              <h1 className="font-semibold text-lg tracking-tight text-[#1d1d1f] whitespace-nowrap">OpenClaw</h1>
              <p className="text-xs text-[#86868b] whitespace-nowrap">控制中心</p>
            </div>
          )}
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center ${collapsed ? 'justify-center px-0' : 'space-x-3 px-3'} py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
                  ${isActive 
                    ? 'bg-[#007aff] text-white shadow-sm' 
                    : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}
                `}
                title={collapsed ? item.label : ''}
              >
                <span className={`text-xl ${isActive ? 'text-white' : 'text-[#86868b] group-hover:text-[#1d1d1f]'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium text-[15px] whitespace-nowrap">{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#e5e5e5]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-2 py-2 rounded-lg hover:bg-[#f5f5f7] cursor-pointer transition-colors`}>
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium flex-shrink-0">
            KK
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1d1d1f] truncate">管理员</p>
              <p className="text-xs text-[#86868b] truncate">admin@openclaw.ai</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
