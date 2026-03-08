import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const LogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, error, warn, info
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLogs();
      // Ensure data is an array
      setLogs(Array.isArray(data) ? data : (data.logs || []));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'warn': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchFilter = filter === 'all' || log.level?.toLowerCase() === filter;
    const matchSearch = !search || 
      log.message?.toLowerCase().includes(search.toLowerCase()) ||
      log.agent_id?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: logs.length,
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-8 font-apple">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">系统日志</h1>
        <p className="text-[#86868b] mt-1">监控系统事件和错误。</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-[#86868b] uppercase">总事件数</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-red-500 uppercase">错误</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.error}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-orange-500 uppercase">警告</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.warn}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e5e5e5] shadow-sm">
          <p className="text-xs font-medium text-blue-500 uppercase">信息</p>
          <p className="text-2xl font-semibold text-[#1d1d1f] mt-1">{stats.info}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-2 bg-white p-1 rounded-lg border border-[#d2d2d7] shadow-sm">
          {[
            { id: 'all', label: '全部' },
            { id: 'error', label: '错误' },
            { id: 'warn', label: '警告' },
            { id: 'info', label: '信息' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === type.id 
                  ? 'bg-[#007aff] text-white shadow-sm' 
                  : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="搜索日志..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#d2d2d7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007aff]/20 focus:border-[#007aff] transition-all"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#86868b]">正在加载日志...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#1d1d1f] font-medium">未找到日志</p>
            <p className="text-[#86868b] text-sm mt-1">尝试调整筛选条件。</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f5f7]">
            {filteredLogs.map((log, index) => (
              <div key={log.id || index} className="p-4 hover:bg-[#f9f9f9] transition-colors flex items-start space-x-4">
                <span className={`flex-shrink-0 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${getLevelColor(log.level)}`}>
                  {log.level}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm font-medium text-[#1d1d1f] font-mono truncate pr-4">
                      {log.agent_id ? `[${log.agent_id}] ` : ''}{log.message}
                    </p>
                    <span className="text-xs text-[#86868b] whitespace-nowrap font-mono">
                      {new Date(log.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  {log.details && (
                    <pre className="mt-2 p-3 bg-[#f5f5f7] rounded-lg text-xs font-mono text-[#424245] overflow-x-auto border border-[#e5e5e5]">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogPage;
