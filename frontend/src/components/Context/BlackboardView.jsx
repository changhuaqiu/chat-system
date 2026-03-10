import React, { useState } from 'react';

/**
 * 黑板可视化组件 - 像素风格
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
      color: 'border-pixel-accent-cyan bg-pixel-accent-cyan',
      bgColor: 'bg-pixel-accent-cyan/20',
      borderColor: 'border-pixel-accent-cyan',
      content: '',
      updatedAt: null
    },
    {
      id: 'database-design',
      name: '数据库设计',
      icon: 'ri-database-2-line',
      color: 'border-pixel-accent-purple bg-pixel-accent-purple',
      bgColor: 'bg-pixel-accent-purple/20',
      borderColor: 'border-pixel-accent-purple',
      content: '',
      updatedAt: null
    },
    {
      id: 'decisions',
      name: '已做决策',
      icon: 'ri-checkbox-circle-line',
      color: 'border-pixel-accent-green bg-pixel-accent-green',
      bgColor: 'bg-pixel-accent-green/20',
      borderColor: 'border-pixel-accent-green',
      content: '',
      updatedAt: null
    },
    {
      id: 'notes',
      name: '讨论笔记',
      icon: 'ri-sticky-note-line',
      color: 'border-pixel-accent-orange bg-pixel-accent-orange',
      bgColor: 'bg-pixel-accent-orange/20',
      borderColor: 'border-pixel-accent-orange',
      content: '',
      updatedAt: null
    }
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;

  return (
    <div className="bg-bg-card border-4 border-border overflow-hidden">
      {/* 头部 */}
      <div className="bg-bg-card border-b-4 border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="ri-layout-grid-line text-pixel-accent-purple text-xl" />
          <div>
            <h3 className="text-base font-pixel-title text-white">协作黑板</h3>
            <p className="text-xs text-pixel-gray font-pixel-body">团队知识共享空间</p>
          </div>
        </div>
        <button className="px-4 py-2 border-4 border-pixel-primary bg-pixel-primary text-white text-sm font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple flex items-center gap-2 transition-colors">
          <i className="ri-add-line" />
          添加内容
        </button>
      </div>

      {/* 分区网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        {displaySections.map((section) => (
          <div
            key={section.id}
            className="border-4 border-border bg-bg-secondary overflow-hidden hover:border-pixel-accent-purple transition-all"
          >
            {/* 分区头部 */}
            <div
              className="px-4 py-3 border-b-4 border-border cursor-pointer hover:bg-bg-card"
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 border-4 ${section.color} flex items-center justify-center`}>
                    <i className={`${section.icon} text-white text-sm`} />
                  </div>
                  <span className="text-sm font-pixel-title text-white">{section.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {section.updatedAt && (
                    <span className="text-xs text-pixel-gray font-pixel-body">
                      {new Date(section.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                  <i
                    className={`ri-arrow-down-s-line transition-transform ${
                      activeSection === section.id ? 'rotate-180' : ''
                    } text-pixel-gray`}
                  />
                </div>
              </div>
            </div>

            {/* 分区内容 */}
            {activeSection === section.id && (
              <div className="p-4">
                {section.content ? (
                  <div className="text-sm text-white font-pixel-body whitespace-pre-wrap">{section.content}</div>
                ) : (
                  <div className="text-sm text-pixel-gray font-pixel-body">暂无内容，点击编辑添加</div>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t-4 border-border">
                  <button
                    onClick={() => setEditingSection(section.id)}
                    className="px-3 py-1.5 border-4 border-border bg-bg-card text-pixel-gray hover:text-white hover:border-pixel-primary transition-all text-xs font-pixel-body flex items-center gap-1"
                  >
                    <i className="ri-edit-line" />
                    编辑
                  </button>
                  <button className="px-3 py-1.5 border-4 border-border bg-bg-card text-pixel-gray hover:text-white hover:border-pixel-primary transition-all text-xs font-pixel-body flex items-center gap-1">
                    <i className="ri-history-line" />
                    历史
                  </button>
                  <button className="px-3 py-1.5 border-4 border-border bg-bg-card text-pixel-gray hover:text-white hover:border-pixel-primary transition-all text-xs font-pixel-body flex items-center gap-1">
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
