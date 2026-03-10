import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import Layout from '../components/Layout';
import CharacterCardPreview from '../components/CharacterCard/CharacterCardPreview';
import DraggableCard from '../components/CharacterCard/DraggableCard';

function CharacterCardLibrary() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setLoading(true);
        setCharacters([
          {
            id: 'dev-backend',
            name: '后端开发专家',
            description: '专注于 API 设计、数据库架构、系统性能优化的后端开发专家',
            avatar: 'DB',
            expertise: ['coding', 'api_design', 'database', 'system_design'],
            canWorkAs: ['worker', 'expert'],
            collaborationSkills: ['task_execution', 'code_review', 'technical_advice'],
            status: 'active'
          },
          {
            id: 'ux-design',
            name: 'UX 设计师',
            description: '专注于用户体验设计、视觉原型、HTML/CSS 交付的设计专家',
            avatar: 'UX',
            expertise: ['design', 'ui', 'prototyping'],
            canWorkAs: ['worker', 'expert'],
            collaborationSkills: ['task_execution', 'design_review'],
            status: 'active'
          },
          {
            id: 'pm-lead',
            name: '研发主管',
            description: '负责 BPM 流程管理、团队协调、风险拦截、项目交付的主管',
            avatar: 'PM',
            expertise: ['management', 'coordination'],
            canWorkAs: ['coordinator', 'expert'],
            collaborationSkills: ['task_decomposition', 'team_coordination'],
            status: 'active'
          },
          {
            id: 'ai-analyst',
            name: 'AI 分析员',
            description: '专注于数据分析、趋势预测、报表生成的 AI 专家',
            avatar: 'AI',
            expertise: ['analysis', 'statistics'],
            canWorkAs: ['expert'],
            collaborationSkills: ['data_analysis', 'report_generation'],
            status: 'draft'
          }
        ]);
      } catch (error) {
        console.error('Failed to load characters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, []);

  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch =
        searchQuery === '' ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.expertise?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = filterCategory === 'all' ||
        (filterCategory === 'development' && char.expertise?.some(t => ['coding', 'api_design', 'database'].includes(t))) ||
        (filterCategory === 'design' && char.expertise?.some(t => ['design', 'ui', 'prototyping'].includes(t))) ||
        (filterCategory === 'management' && char.expertise?.some(t => ['management', 'coordination'].includes(t)));

      return matchesSearch && matchesCategory;
    });
  }, [characters, searchQuery, filterCategory]);

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
  };

  const handleEditCharacter = () => {
    if (selectedCharacter) {
      navigate(`/characters/${selectedCharacter.id}/edit`);
    }
  };

  const handleCreateCharacter = () => {
    navigate('/characters/new');
  };

  const handleTestCharacter = () => {
    if (selectedCharacter) {
      navigate(`/characters/${selectedCharacter.id}/test`);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：角色卡列表 - 像素风格 */}
        <div className="w-96 flex flex-col border-r-4 border-border bg-bg-secondary">
          <div className="p-6 border-b-4 border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-pixel-title text-white">角色卡管理</h1>
                <p className="text-sm text-pixel-gray mt-1 font-pixel-body">管理机器人的人格设定</p>
              </div>
            </div>

            {/* 搜索和创建 */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-pixel-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索角色卡..."
                  className="w-full pl-11 pr-4 py-2.5 bg-bg-input border-4 border-border text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors font-pixel-body"
                />
              </div>
              <button
                onClick={handleCreateCharacter}
                className="p-2.5 btn-primary"
              >
                <i className="ri-add-line text-white text-xl" />
              </button>
            </div>

            {/* 类别筛选 - 像素风格 */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 text-xs font-pixel-title transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark'
                    : 'text-pixel-gray border-4 border-transparent hover:border-border'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterCategory('development')}
                className={`px-3 py-1.5 text-xs font-pixel-title transition-colors ${
                  filterCategory === 'development'
                    ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark'
                    : 'text-pixel-gray border-4 border-transparent hover:border-border'
                }`}
              >
                开发
              </button>
              <button
                onClick={() => setFilterCategory('design')}
                className={`px-3 py-1.5 text-xs font-pixel-title transition-colors ${
                  filterCategory === 'design'
                    ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark'
                    : 'text-pixel-gray border-4 border-transparent hover:border-border'
                }`}
              >
                设计
              </button>
              <button
                onClick={() => setFilterCategory('management')}
                className={`px-3 py-1.5 text-xs font-pixel-title transition-colors ${
                  filterCategory === 'management'
                    ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark'
                    : 'text-pixel-gray border-4 border-transparent hover:border-border'
                }`}
              >
                管理
              </button>
            </div>

            {/* 视图切换 */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark' : 'text-pixel-gray border-4 border-transparent'
                }`}
              >
                <i className="ri-grid-line" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark' : 'text-pixel-gray border-4 border-transparent'
                }`}
              >
                <i className="ri-list" />
              </button>
            </div>
          </div>

          {/* 角色卡列表 */}
          <div className="flex-1 overflow-y-auto pixel-scrollbar p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="character-card p-5 border-4 border-border bg-bg-card skeleton h-24" />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredCharacters.map((char) => (
                  <CharacterCardPreview
                    key={char.id}
                    character={char}
                    onClick={handleSelectCharacter}
                    isSelected={selectedCharacter?.id === char.id}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCharacters.map((char) => (
                  <DraggableCard
                    key={char.id}
                    character={char}
                  />
                ))}
              </div>
            )}

            {filteredCharacters.length === 0 && !loading && (
              <div className="text-center py-12">
                <i className="ri-folder-unknow-line text-4xl text-pixel-gray mb-4" />
                <p className="text-pixel-gray font-pixel-body">暂无角色卡</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：详情/操作面板 - 像素风格 */}
        <div className="flex-1 flex flex-col bg-bg-primary">
          {selectedCharacter ? (
            <>
              {/* 顶部操作栏 */}
              <div className="bg-bg-secondary border-b-4 border-border px-8 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pixel-primary border-4 border-pixel-primary-dark flex items-center justify-center text-white font-pixel-title shadow-pixel-sm">
                      {selectedCharacter.avatar}
                    </div>
                    <div>
                      <h2 className="text-lg font-pixel-title text-white">
                        {selectedCharacter.name}
                      </h2>
                      <p className="text-sm text-pixel-gray mt-1 font-pixel-body">
                        最后更新：2026-03-09
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTestCharacter}
                      className="px-4 py-2 btn-secondary text-pixel-gray text-sm font-pixel-title flex items-center gap-2"
                    >
                      <i className="ri-play-line" />
                      测试角色
                    </button>
                    <button
                      onClick={handleEditCharacter}
                      className="px-4 py-2 btn-primary text-white text-sm font-pixel-title flex items-center gap-2"
                    >
                      <i className="ri-edit-line" />
                      编辑
                    </button>
                  </div>
                </div>
              </div>

              {/* 详情内容 */}
              <div className="flex-1 overflow-y-auto pixel-scrollbar p-8">
                <div className="max-w-2xl">
                  {/* 描述 */}
                  <div className="mb-6">
                    <label className="block text-sm font-pixel-title text-pixel-gray mb-2">
                      角色描述
                    </label>
                    <p className="text-white font-pixel-body">{selectedCharacter.description}</p>
                  </div>

                  {/* 专长领域 */}
                  <div className="mb-6">
                    <label className="block text-sm font-pixel-title text-pixel-gray mb-2">
                      专长领域
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.expertise?.map((tag, idx) => (
                        <span
                          key={idx}
                          className="tag-expertise px-3 py-1.5 text-sm font-pixel-body"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 可担任角色 */}
                  <div className="mb-6">
                    <label className="block text-sm font-pixel-title text-pixel-gray mb-2">
                      可担任角色
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacter.canWorkAs?.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-pixel-accent-purple/20 text-pixel-accent-purple text-sm font-pixel-body border-2 border-pixel-accent-purple"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 协作技能 */}
                  {selectedCharacter.collaborationSkills && (
                    <div>
                      <label className="block text-sm font-pixel-title text-pixel-gray mb-2">
                        协作技能
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacter.collaborationSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="tag-skill px-3 py-1.5 text-sm font-pixel-body"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <i className="ri-contact-card-line text-6xl text-pixel-gray/50 mb-4" />
                <p className="text-pixel-gray font-pixel-body">选择一个角色卡查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CharacterCardLibrary;
