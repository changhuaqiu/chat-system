import React from 'react';

/**
 * 专家会诊模式视图 - 像素风格
 * 特点：专家席位、投票面板、决策汇总
 */
const PanelView = ({ children, roomInfo, members }) => {
  const [votes, setVotes] = React.useState({});

  const experts = [
    { id: 1, name: 'dev-backend', role: '后端专家', avatar: 'DB', color: 'border-pixel-accent-purple bg-pixel-accent-purple' },
    { id: 2, name: 'ux-design', role: '设计专家', avatar: 'UX', color: 'border-pixel-accent-pink bg-pixel-accent-pink' },
    { id: 3, name: 'qa-tester', role: '测试专家', avatar: 'QA', color: 'border-pixel-accent-orange bg-pixel-accent-orange' }
  ];

  const currentDecision = {
    topic: 'API 设计方案',
    options: [
      { id: 'a', name: 'RESTful API', votes: 2 },
      { id: 'b', name: 'GraphQL', votes: 1 }
    ]
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部信息栏 - 显示决策面板 */}
        <div className="bg-bg-card border-b-4 border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-pixel-title text-white flex items-center gap-2">
                <i className="ri-group-2-line text-pixel-accent-purple" />
                {roomInfo?.name || '专家会诊'}
              </h2>
              <p className="text-sm text-pixel-gray mt-1 font-pixel-body">
                {roomInfo?.description || '多专家独立意见'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 投票状态 */}
              <div className="flex items-center gap-3 px-4 py-2 border-4 border-pixel-accent-purple bg-pixel-accent-purple/20">
                <i className="ri-vote-line text-pixel-accent-purple" />
                <span className="text-sm text-white font-pixel-body">进行中的投票</span>
                <span className="px-2 py-0.5 border-2 border-pixel-accent-purple bg-pixel-accent-purple text-white text-xs font-pixel-title">
                  {currentDecision.options.reduce((sum, opt) => sum + opt.votes, 0)} 票
                </span>
              </div>
            </div>
          </div>

          {/* 当前决策主题 */}
          <div className="p-4 border-4 border-border bg-bg-secondary">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-pixel-title text-white">当前议题</span>
              <span className="text-xs text-pixel-gray font-pixel-body">{currentDecision.topic}</span>
            </div>
            <div className="flex items-center gap-4">
              {currentDecision.options.map((option) => (
                <div key={option.id} className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-pixel-body">{option.name}</span>
                    <span className="text-xs text-pixel-gray font-pixel-body">{option.votes}票</span>
                  </div>
                  <div className="w-full h-4 bg-bg-primary border-4 border-border overflow-hidden">
                    <div
                      className="h-full bg-pixel-accent-purple transition-all duration-500"
                      style={{ width: `${(option.votes / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* 右侧：专家席位 */}
      <div className="w-72 border-l-4 border-border flex flex-col bg-bg-card">
        <div className="p-4 border-b-4 border-border">
          <h3 className="text-sm font-pixel-title text-white flex items-center gap-2">
            <i className="ri-star-line text-pixel-accent-purple" />
            专家席位
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="p-3 border-4 border-border bg-bg-secondary hover:border-pixel-accent-purple hover:bg-pixel-accent-purple/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 border-4 ${expert.color} flex items-center justify-center shadow-pixel-sm`}>
                  <span className="text-white text-sm font-pixel-title">{expert.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-pixel-title text-white">{expert.name}</span>
                    <div className="w-3 h-3 bg-pixel-accent-green border-2 border-pixel-accent-green" />
                  </div>
                  <p className="text-xs text-pixel-gray font-pixel-body">{expert.role}</p>
                </div>
              </div>
            </div>
          ))}

          {/* 邀请更多专家 */}
          <button className="w-full p-3 border-4 border-dashed border-pixel-border-light text-pixel-gray text-sm font-pixel-body
            hover:bg-bg-secondary hover:border-pixel-accent-purple transition-all flex items-center justify-center gap-2">
            <i className="ri-add-line" />
            邀请专家
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelView;
