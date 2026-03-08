import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const CharacterCardEditor = () => {
  const { botId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [card, setCard] = useState({
    // 基础信息
    name: '',
    description: '',
    avatar: '',

    // 性格设定
    personality: '',
    scenario: '',
    mes_example: '',
    first_mes: '',

    // 系统指令
    system_prompt: '',
    post_history_instructions: '',

    // 扩展设置
    creator_notes: '',
    tags: [],
    version: 'chara-card-v2',
    extensions: {
      speakingStyle: {
        tone: 'neutral',
        emojiUsage: 'none',
        sentenceLength: 'medium'
      },
      restrictions: [],
      catchphrases: []
    }
  });

  // 加载角色卡和模板
  useEffect(() => {
    loadData();
  }, [botId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // 加载当前角色卡
      const cardRes = await apiService.getCharacterCard(botId);
      if (cardRes.success && cardRes.card) {
        setCard(prev => ({
          ...prev,
          ...cardRes.card,
          extensions: {
            ...prev.extensions,
            ...(cardRes.card.extensions || {})
          }
        }));
      }

      // 加载模板列表
      const templatesRes = await apiService.getCharacterCardTemplates();
      if (templatesRes.success) {
        setTemplates(templatesRes.templates || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 加载模板
  const handleLoadTemplate = async (templateName) => {
    try {
      const res = await apiService.loadCharacterCardTemplate(templateName);
      if (res.success && res.card) {
        setCard(prev => ({
          ...prev,
          ...res.card,
          extensions: {
            ...prev.extensions,
            ...(res.card.extensions || {})
          }
        }));
        setShowTemplateModal(false);
        alert('模板加载成功！');
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      alert('加载模板失败：' + error.message);
    }
  };

  // 保存角色卡
  const handleSave = async () => {
    if (!card.name) {
      alert('请输入角色名称');
      setActiveTab('basic');
      return;
    }

    try {
      setSaving(true);
      const res = await apiService.saveCharacterCard(botId, card);
      if (res.success) {
        alert('保存成功！');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败：' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 获取预览
  const handlePreview = async () => {
    try {
      const res = await apiService.getCharacterCardPreview(botId);
      if (res.success && res.preview) {
        setPreview(res.preview);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('获取预览失败:', error);
      alert('获取预览失败：' + error.message);
    }
  };

  // 更新卡片数据
  const updateCard = (field, value) => {
    setCard(prev => ({ ...prev, [field]: value }));
  };

  // 更新扩展数据
  const updateExtension = (field, value) => {
    setCard(prev => ({
      ...prev,
      extensions: {
        ...prev.extensions,
        [field]: value
      }
    }));
  };

  // 更新说话风格
  const updateSpeakingStyle = (field, value) => {
    setCard(prev => ({
      ...prev,
      extensions: {
        ...prev.extensions,
        speakingStyle: {
          ...prev.extensions.speakingStyle,
          [field]: value
        }
      }
    }));
  };

  // 标签处理
  const addTag = () => {
    const tag = prompt('请输入标签:');
    if (tag && !card.tags.includes(tag)) {
      updateCard('tags', [...card.tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    updateCard('tags', card.tags.filter(t => t !== tagToRemove));
  };

  // 口头禅处理
  const addCatchphrase = () => {
    const phrase = prompt('请输入口头禅:');
    if (phrase && !card.extensions.catchphrases.includes(phrase)) {
      updateExtension('catchphrases', [...card.extensions.catchphrases, phrase]);
    }
  };

  const removeCatchphrase = (phraseToRemove) => {
    updateExtension('catchphrases', card.extensions.catchphrases.filter(p => p !== phraseToRemove));
  };

  // 限制处理
  const addRestriction = () => {
    const restriction = prompt('请输入限制:');
    if (restriction) {
      updateExtension('restrictions', [...card.extensions.restrictions, restriction]);
    }
  };

  const removeRestriction = (indexToRemove) => {
    updateExtension('restrictions', card.extensions.restrictions.filter((_, i) => i !== indexToRemove));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">角色卡编辑</h1>
              <p className="text-sm text-gray-500 mt-1">为机器人配置人格化设定</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                📋 加载模板
              </button>
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                👁️ 预览
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '💾 保存'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'basic'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                基础信息
              </button>
              <button
                onClick={() => setActiveTab('personality')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'personality'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                性格设定
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'system'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                系统指令
              </button>
              <button
                onClick={() => setActiveTab('extensions')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'extensions'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                扩展设置
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-4">
              {/* Tab 1: 基础信息 */}
              {activeTab === 'basic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      角色名称 *
                    </label>
                    <input
                      type="text"
                      value={card.name}
                      onChange={(e) => updateCard('name', e.target.value)}
                      placeholder="例如：开发助手"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      简短描述
                    </label>
                    <input
                      type="text"
                      value={card.description}
                      onChange={(e) => updateCard('description', e.target.value)}
                      placeholder="100 字内的简短描述"
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{card.description?.length || 0}/100</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      头像
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl">
                        {card.avatar || '🤖'}
                      </div>
                      <input
                        type="text"
                        value={card.avatar}
                        onChange={(e) => updateCard('avatar', e.target.value)}
                        placeholder="输入 emoji 或图片 URL"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      首次见面问候语
                    </label>
                    <input
                      type="text"
                      value={card.first_mes}
                      onChange={(e) => updateCard('first_mes', e.target.value)}
                      placeholder="第一次见面时说的话"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Tab 2: 性格设定 */}
              {activeTab === 'personality' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      性格描述
                    </label>
                    <textarea
                      value={card.personality}
                      onChange={(e) => updateCard('personality', e.target.value)}
                      placeholder="详细描述角色的性格特点、行为方式等"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      例：专业、耐心、注重细节。热爱技术分享，喜欢用比喻解释复杂概念。
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      场景设定
                    </label>
                    <textarea
                      value={card.scenario}
                      onChange={(e) => updateCard('scenario', e.target.value)}
                      placeholder="描述当前场景/上下文"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      例：你正在一个项目聊天室中，这里是开发团队讨论技术和协作的地方。
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      示例对话
                    </label>
                    <textarea
                      value={card.mes_example}
                      onChange={(e) => updateCard('mes_example', e.target.value)}
                      placeholder="用 &lt;START&gt; 分隔的示例对话"
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      格式：{'<START>'} 用户：问题 {'\n'} 角色：回答
                    </p>
                  </div>
                </>
              )}

              {/* Tab 3: 系统指令 */}
              {activeTab === 'system' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Prompt
                    </label>
                    <textarea
                      value={card.system_prompt}
                      onChange={(e) => updateCard('system_prompt', e.target.value)}
                      placeholder="定制 System Prompt"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      优先级最高，会直接覆盖默认的 system prompt
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      后处理指令
                    </label>
                    <textarea
                      value={card.post_history_instructions}
                      onChange={(e) => updateCard('post_history_instructions', e.target.value)}
                      placeholder="额外的处理指令"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      在对话历史后追加的指令
                    </p>
                  </div>
                </>
              )}

              {/* Tab 4: 扩展设置 */}
              {activeTab === 'extensions' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        语气
                      </label>
                      <select
                        value={card.extensions.speakingStyle.tone}
                        onChange={(e) => updateSpeakingStyle('tone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="formal">正式 (Formal)</option>
                        <option value="casual">随意 (Casual)</option>
                        <option value="cute">可爱 (Cute)</option>
                        <option value="professional">专业 (Professional)</option>
                        <option value="neutral">中性 (Neutral)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emoji 使用
                      </label>
                      <select
                        value={card.extensions.speakingStyle.emojiUsage}
                        onChange={(e) => updateSpeakingStyle('emojiUsage', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">不使用</option>
                        <option value="sparse">少量使用</option>
                        <option value="frequent">频繁使用</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        句子长度
                      </label>
                      <select
                        value={card.extensions.speakingStyle.sentenceLength}
                        onChange={(e) => updateSpeakingStyle('sentenceLength', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="short">短句</option>
                        <option value="medium">中等</option>
                        <option value="long">长句</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标签
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {card.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={addTag}
                      className="px-3 py-1 text-sm border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + 添加标签
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      口头禅
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {card.extensions.catchphrases.map((phrase, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700"
                        >
                          {phrase}
                          <button
                            onClick={() => removeCatchphrase(phrase)}
                            className="ml-2 text-purple-500 hover:text-purple-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={addCatchphrase}
                      className="px-3 py-1 text-sm border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + 添加口头禅
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      限制
                    </label>
                    <div className="space-y-2 mb-2">
                      {card.extensions.restrictions.map((restriction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <span className="text-sm text-red-700">{restriction}</span>
                          <button
                            onClick={() => removeRestriction(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addRestriction}
                      className="px-3 py-1 text-sm border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + 添加限制
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      创作者备注
                    </label>
                    <textarea
                      value={card.creator_notes}
                      onChange={(e) => updateCard('creator_notes', e.target.value)}
                      placeholder="仅供创作者查看的备注信息"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">加载模板</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {templates.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">暂无可用模板</p>
              ) : (
                templates.map((template) => (
                  <button
                    key={template}
                    onClick={() => handleLoadTemplate(template)}
                    className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    {template}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">角色卡预览</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl">
                  {card.avatar || '🤖'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{preview.name}</h4>
                  <p className="text-sm text-gray-500">{preview.description}</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-1">性格</h5>
                <p className="text-sm text-gray-600">{preview.personality}</p>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-1">场景</h5>
                <p className="text-sm text-gray-600">{preview.scenario}</p>
              </div>

              {preview.exampleDialogues?.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">示例对话</h5>
                  <div className="space-y-2">
                    {preview.exampleDialogues.map((dialogue, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {dialogue.substring(0, 100)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.speakingStyle && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">说话风格</h5>
                  <div className="text-sm text-gray-600">
                    语气：{preview.speakingStyle.tone} |
                    Emoji: {preview.speakingStyle.emojiUsage} |
                    句长：{preview.speakingStyle.sentenceLength}
                  </div>
                </div>
              )}

              {preview.tags?.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">标签</h5>
                  <div className="flex flex-wrap gap-2">
                    {preview.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCardEditor;
