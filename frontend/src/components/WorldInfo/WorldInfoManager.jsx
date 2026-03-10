import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';

/**
 * World Info 管理组件 - 像素风格
 */
const WorldInfoManager = ({ isOpen, onClose }) => {
  const { roomId: urlRoomId } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(urlRoomId || 'general');
  const [rooms, setRooms] = useState([]);

  // 编辑状态
  const [editingEntry, setEditingEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    keys: [],
    content: '',
    priority: 0,
    sticky: false,
    enabled: true
  });

  const [keyInput, setKeyInput] = useState('');

  // 加载房间列表和条目
  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedRoom) {
      loadEntries(selectedRoom);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const res = await apiService.getRooms();
      setRooms(res.rooms || []);
      if (!selectedRoom && res.rooms?.length > 0) {
        setSelectedRoom(res.rooms[0].id || 'general');
      }
    } catch (error) {
      console.error('加载房间失败:', error);
    }
  };

  const loadEntries = async (roomId) => {
    try {
      setLoading(true);
      const res = await apiService.getWorldInfoEntries(roomId);
      if (res.success) {
        setEntries(res.entries || []);
      }
    } catch (error) {
      console.error('加载条目失败:', error);
      alert('加载条目失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 打开编辑表单
  const openEditor = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        name: entry.name,
        keys: entry.keys || [],
        content: entry.content,
        priority: entry.priority || 0,
        sticky: entry.sticky || false,
        enabled: entry.enabled !== false
      });
    } else {
      setEditingEntry(null);
      setFormData({
        name: '',
        keys: [],
        content: '',
        priority: 0,
        sticky: false,
        enabled: true
      });
    }
    setIsEditing(true);
  };

  // 关闭编辑器
  const closeEditor = () => {
    setIsEditing(false);
    setEditingEntry(null);
  };

  // 保存条目
  const handleSave = async () => {
    if (!formData.name || !formData.content) {
      alert('请填写名称和内容');
      return;
    }

    try {
      setSaving(true);
      if (editingEntry?.id) {
        await apiService.updateWorldInfo(editingEntry.id, {
          ...formData,
          roomId: selectedRoom
        });
      } else {
        await apiService.createWorldInfo({
          ...formData,
          roomId: selectedRoom
        });
      }

      await loadEntries(selectedRoom);
      closeEditor();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败：' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 删除条目
  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个条目吗？')) return;

    try {
      await apiService.deleteWorldInfo(id);
      await loadEntries(selectedRoom);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败：' + error.message);
    }
  };

  // 添加关键词
  const addKey = () => {
    if (keyInput.trim() && !formData.keys.includes(keyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keys: [...prev.keys, keyInput.trim()]
      }));
      setKeyInput('');
    }
  };

  // 移除关键词
  const removeKey = (keyToRemove) => {
    setFormData(prev => ({
      ...prev,
      keys: prev.keys.filter(k => k !== keyToRemove)
    }));
  };

  // 测试匹配
  const handleTest = async () => {
    const message = prompt('请输入测试消息:');
    if (!message) return;

    try {
      const res = await apiService.testWorldInfoMatch(selectedRoom, message);
      if (res.success) {
        const matchedCount = res.matched?.count || 0;
        const stickyCount = res.sticky?.count || 0;
        alert(`匹配结果:\n- 关键词匹配：${matchedCount} 条\n- 常驻条目：${stickyCount} 条`);
      }
    } catch (error) {
      console.error('测试失败:', error);
      alert('测试失败：' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-bg-card border-8 border-border w-full max-w-4xl p-6 shadow-pixel-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b-4 border-border">
          <div>
            <h2 className="text-xl font-pixel-title text-white">World Info 管理</h2>
            <p className="text-sm text-pixel-gray mt-1 font-pixel-body">配置动态上下文注入</p>
          </div>
          <button
            onClick={onClose}
            className="text-pixel-gray hover:text-white text-xl font-pixel-title px-2"
          >
            ×
          </button>
        </div>

        {/* Room Selector */}
        <div className="mb-4 flex items-center space-x-3">
          <label className="text-sm font-pixel-title text-white">选择房间:</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 border-4 border-border bg-bg-secondary text-white focus:border-pixel-primary outline-none font-pixel-body"
          >
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
            <option value="general">General (默认)</option>
          </select>

          <button
            onClick={handleTest}
            className="ml-auto px-4 py-2 border-4 border-pixel-accent-purple bg-pixel-accent-purple/20 text-pixel-accent-purple text-sm font-pixel-body hover:bg-pixel-accent-purple/30 transition-colors"
          >
            🧪 测试匹配
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex space-x-4">
          {/* Entries List */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-pixel-title text-white">条目列表</h3>
              <button
                onClick={() => openEditor()}
                className="px-3 py-1.5 border-4 border-pixel-primary bg-pixel-primary text-white text-sm font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple transition-colors"
              >
                + 添加条目
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-pixel-primary border-t-transparent"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-pixel-gray font-pixel-body">
                暂无条目，点击上方按钮添加
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 border-4 cursor-pointer transition-colors ${
                      entry.sticky ? 'border-pixel-accent-orange bg-pixel-accent-orange/20' :
                      entry.enabled ? 'border-border bg-bg-secondary hover:border-pixel-border-light' :
                      'border-border bg-bg-secondary opacity-60'
                    }`}
                    onClick={() => openEditor(entry)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-pixel-title text-white">{entry.name}</span>
                          {entry.sticky && (
                            <span className="px-1.5 py-0.5 border-2 border-pixel-accent-orange bg-pixel-accent-orange/30 text-pixel-accent-orange text-xs font-pixel-body">
                              Sticky
                            </span>
                          )}
                          {!entry.enabled && (
                            <span className="px-1.5 py-0.5 border-2 border-border text-pixel-gray text-xs font-pixel-body">
                              已禁用
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-pixel-gray mt-1 font-pixel-body">
                          关键词：{entry.keys?.join(', ') || '无'}
                        </div>
                        <div className="text-xs text-pixel-gray mt-1 font-pixel-body">
                          优先级：{entry.priority}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        className="p-1 text-pixel-accent-pink hover:bg-pixel-accent-pink/20 border-2 border-transparent hover:border-pixel-accent-pink"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor Modal (inline) */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t-4 border-border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-pixel-title text-white">
                {editingEntry ? '编辑条目' : '新建条目'}
              </h3>
              <button
                onClick={closeEditor}
                className="text-pixel-gray hover:text-white font-pixel-title px-2"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-pixel-title text-white mb-1">
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：项目技术栈"
                  className="w-full px-3 py-2 border-4 border-border bg-bg-secondary text-white focus:border-pixel-primary outline-none font-pixel-body"
                />
              </div>

              <div>
                <label className="block text-sm font-pixel-title text-white mb-1">
                  触发关键词
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKey())}
                    placeholder="输入关键词后按回车添加"
                    className="flex-1 px-3 py-2 border-4 border-border bg-bg-secondary text-white focus:border-pixel-primary outline-none font-pixel-body"
                  />
                  <button
                    onClick={addKey}
                    className="px-3 py-2 border-4 border-pixel-primary bg-pixel-primary text-white hover:bg-pixel-accent-purple hover:border-pixel-accent-purple font-pixel-body"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keys.map((key, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 border-2 border-pixel-primary bg-pixel-primary/20 text-pixel-accent-cyan text-sm font-pixel-body"
                    >
                      {key}
                      <button
                        onClick={() => removeKey(key)}
                        className="ml-1 text-pixel-primary hover:text-pixel-accent-pink"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-pixel-gray mt-1 font-pixel-body">消息中包含关键词时会注入此条目</p>
              </div>

              <div>
                <label className="block text-sm font-pixel-title text-white mb-1">
                  内容 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="要注入的上下文内容"
                  rows={4}
                  className="w-full px-3 py-2 border-4 border-border bg-bg-secondary text-white focus:border-pixel-primary outline-none font-pixel-body resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-pixel-title text-white mb-1">
                    优先级
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border-4 border-border bg-bg-secondary text-white focus:border-pixel-primary outline-none font-pixel-body"
                  />
                  <p className="text-xs text-pixel-gray mt-1 font-pixel-body">数字越大优先级越高</p>
                </div>

                <div className="flex items-center space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sticky}
                      onChange={(e) => setFormData(prev => ({ ...prev, sticky: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 border-4 transition-colors ${formData.sticky ? 'border-pixel-accent-orange bg-pixel-accent-orange' : 'border-border bg-bg-secondary'}`}>
                      <div className={`w-4 h-4 bg-white transition-transform ${formData.sticky ? 'translate-x-5' : 'translate-x-0'} mt-0.5`}></div>
                    </div>
                    <span className="ml-2 text-sm font-pixel-body text-white">常驻 (Sticky)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 border-4 transition-colors ${formData.enabled ? 'border-pixel-accent-green bg-pixel-accent-green' : 'border-border bg-bg-secondary'}`}>
                    <div className={`w-4 h-4 bg-white transition-transform ${formData.enabled ? 'translate-x-5' : 'translate-x-0'} mt-0.5`}></div>
                  </div>
                  <span className="ml-2 text-sm font-pixel-body text-white">启用</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t-4 border-border">
              <button
                onClick={closeEditor}
                className="px-4 py-2 border-4 border-border text-white font-pixel-body hover:bg-bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 border-4 border-pixel-primary bg-pixel-primary text-white font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldInfoManager;
