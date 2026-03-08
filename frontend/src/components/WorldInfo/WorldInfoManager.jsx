import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';

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
      // 如果没有选择房间，默认使用第一个或 general
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
        // 更新
        await apiService.updateWorldInfo(editingEntry.id, {
          ...formData,
          roomId: selectedRoom
        });
      } else {
        // 创建
        await apiService.createWorldInfo({
          ...formData,
          roomId: selectedRoom
        });
      }

      // 重新加载
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">World Info 管理</h2>
            <p className="text-sm text-gray-500 mt-1">配置动态上下文注入</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Room Selector */}
        <div className="mb-4 flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">选择房间:</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
            <option value="general">General (默认)</option>
          </select>

          <button
            onClick={handleTest}
            className="ml-auto px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
          >
            🧪 测试匹配
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex space-x-4">
          {/* Entries List */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">条目列表</h3>
              <button
                onClick={() => openEditor()}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                + 添加条目
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无条目，点击上方按钮添加
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      entry.sticky ? 'border-yellow-300 bg-yellow-50' :
                      entry.enabled ? 'border-gray-200 bg-white hover:bg-gray-50' :
                      'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                    onClick={() => openEditor(entry)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{entry.name}</span>
                          {entry.sticky && (
                            <span className="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded">
                              Sticky
                            </span>
                          )}
                          {!entry.enabled && (
                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                              已禁用
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          关键词：{entry.keys?.join(', ') || '无'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          优先级：{entry.priority}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">
                {editingEntry ? '编辑条目' : '新建条目'}
              </h3>
              <button
                onClick={closeEditor}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：项目技术栈"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  触发关键词
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKey())}
                    placeholder="输入关键词后按回车添加"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addKey}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keys.map((key, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                    >
                      {key}
                      <button
                        onClick={() => removeKey(key)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">消息中包含关键词时会注入此条目</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="要注入的上下文内容"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    优先级
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">数字越大优先级越高</p>
                </div>

                <div className="flex items-center space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sticky}
                      onChange={(e) => setFormData(prev => ({ ...prev, sticky: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.sticky ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${formData.sticky ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">常驻 (Sticky)</span>
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
                  <div className={`w-10 h-6 rounded-full transition-colors ${formData.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${formData.enabled ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">启用</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={closeEditor}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
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
