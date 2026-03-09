import React, { useState } from 'react';

/**
 * 黑板可视化组件
 * 分区展示 API 设计、数据库设计、决策等内容
 */
const BlackboardView = ({ sections = [], onSectionUpdate }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  const defaultSections = [
    {
      id: 'api-design',
      name: 'API 设计',
      icon: 'ri-api-line',
      color: 'from-blue-500 to-cyan-500',
      content: '',
      updatedAt: null
    },
    {
      id: 'database-design',
      name: '数据库设计',
      icon: 'ri-database-2-line',
      color: 'from-purple-500 to-violet-500',
      content: '',
      updatedAt: null
    },
    {
      id: 'decisions',
      name: '已做决策',
      icon: 'ri-checkbox-circle-line',
      color: 'from-emerald-500 to-teal-500',
      content: '',
      updatedAt: null
    },
    {
      id: 'notes',
      name: '讨论笔记',
      icon: 'ri-sticky-note-line',
      color: 'from-amber-500 to-orange-500',
      content: '',
      updatedAt: null
    }
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;

  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
      {/* 头部 */}
      <div className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="ri-layout-grid-line text-purple-400 text-xl" />
          <div>
            <h3 className="text-base font-semibold text-white">协作黑板</h3>
            <p className="text-xs text-white/40">团队知识共享空间</p>
          </div>
        </div>
        <button className="px-4 py-2 btn-primary text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <i className="ri-add-line" />
          添加内容
        </button>
      </div>

      {/* 分区网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        {displaySections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-purple-500/30 transition-all"
          >
            {/* 分区头部 */}
            <div
              className="px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5"
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                    <i className={`${section.icon} text-white text-sm`} />
                  </div>
                  <span className="text-sm font-medium text-white">{section.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {section.updatedAt && (
                    <span className="text-xs text-white/40">
                      {new Date(section.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                  <i
                    className={`ri-arrow-down-s-line transition-transform ${
                      activeSection === section.id ? 'rotate-180' : ''
                    } text-white/40`}
                  />
                </div>
              </div>
            </div>

            {/* 分区内容 */}
            {activeSection === section.id && (
              <div className="p-4">
                {section.content ? (
                  <div className="text-sm text-white/70 whitespace-pre-wrap">{section.content}</div>
                ) : (
                  <div className="text-sm text-white/40 italic">暂无内容，点击编辑添加</div>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setEditingSection(section.id)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs flex items-center gap-1"
                  >
                    <i className="ri-edit-line" />
                    编辑
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs flex items-center gap-1">
                    <i className="ri-history-line" />
                    历史
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs flex items-center gap-1">
                    <i className="ri-share-line" />
                    分享
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlackboardView;
