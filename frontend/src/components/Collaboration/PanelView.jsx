import React from 'react';

/**
 * 专家会诊模式视图
 * 特点：专家席位、投票面板、决策汇总
 */
const PanelView = ({ children, roomInfo, members }) => {
  const [votes, setVotes] = React.useState({});

  const experts = [
    { id: 1, name: 'dev-backend', role: '后端专家', avatar: 'DB', color: 'from-purple-500 to-violet-500' },
    { id: 2, name: 'ux-design', role: '设计专家', avatar: 'UX', color: 'from-pink-500 to-rose-500' },
    { id: 3, name: 'qa-tester', role: '测试专家', avatar: 'QA', color: 'from-amber-500 to-orange-500' }
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
        <div className="glass-panel border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <i className="ri-group-2-line text-purple-400" />
                {roomInfo?.name || '专家会诊'}
              </h2>
              <p className="text-sm text-white/40 mt-1">
                {roomInfo?.description || '多专家独立意见'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 投票状态 */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <i className="ri-vote-line text-purple-400" />
                <span className="text-sm text-white/80">进行中的投票</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-medium">
                  {currentDecision.options.reduce((sum, opt) => sum + opt.votes, 0)} 票
                </span>
              </div>
            </div>
          </div>

          {/* 当前决策主题 */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">当前议题</span>
              <span className="text-xs text-white/40">{currentDecision.topic}</span>
            </div>
            <div className="flex items-center gap-4">
              {currentDecision.options.map((option) => (
                <div key={option.id} className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/80">{option.name}</span>
                    <span className="text-xs text-white/40">{option.votes}票</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
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
      <div className="w-72 border-l border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <i className="ri-star-line text-purple-400" />
            专家席位
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${expert.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-sm font-bold">{expert.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{expert.name}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 online-indicator" />
                  </div>
                  <p className="text-xs text-white/40">{expert.role}</p>
                </div>
              </div>
            </div>
          ))}

          {/* 邀请更多专家 */}
          <button className="w-full p-3 rounded-xl border border-dashed border-white/20 text-white/40 text-sm
            hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-2">
            <i className="ri-add-line" />
            邀请专家
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelView;
