import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/api';

const LogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getLogs();
      setLogs(Array.isArray(data) ? data : (data.logs || []));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getLevelColor = useMemo(() => (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'bg-pixel-accent-pink/20 text-pixel-accent-pink border-pixel-accent-pink';
      case 'warn': return 'bg-pixel-accent-orange/20 text-pixel-accent-orange border-pixel-accent-orange';
      case 'info': return 'bg-pixel-accent-cyan/20 text-pixel-accent-cyan border-pixel-accent-cyan';
      default: return 'bg-bg-card text-pixel-gray border-border';
    }
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchFilter = filter === 'all' || log.level?.toLowerCase() === filter;
      const matchSearch = !search ||
        log.message?.toLowerCase().includes(search.toLowerCase()) ||
        log.agent_id?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [logs, filter, search]);

  const stats = useMemo(() => ({
    total: logs.length,
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info').length
  }), [logs]);

  const handleFilterChange = useCallback((typeId) => {
    setFilter(typeId);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-bg-primary p-8 font-pixel-body pixel-scrollbar">
      <header className="mb-8">
        <h1 className="text-2xl font-pixel-title text-white tracking-tight">系统日志</h1>
        <p className="text-pixel-gray mt-1">监控系统事件和错误。</p>
      </header>

      {/* Stats Cards - 像素风格 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card p-4 border-4 border-border shadow-pixel-sm">
          <p className="text-xs font-pixel-title text-pixel-gray uppercase">总事件数</p>
          <p className="text-2xl font-pixel-title text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-bg-card p-4 border-4 border-border shadow-pixel-sm">
          <p className="text-xs font-pixel-title text-pixel-accent-pink uppercase">错误</p>
          <p className="text-2xl font-pixel-title text-white mt-1">{stats.error}</p>
        </div>
        <div className="bg-bg-card p-4 border-4 border-border shadow-pixel-sm">
          <p className="text-xs font-pixel-title text-pixel-accent-orange uppercase">警告</p>
          <p className="text-2xl font-pixel-title text-white mt-1">{stats.warn}</p>
        </div>
        <div className="bg-bg-card p-4 border-4 border-border shadow-pixel-sm">
          <p className="text-xs font-pixel-title text-pixel-accent-cyan uppercase">信息</p>
          <p className="text-2xl font-pixel-title text-white mt-1">{stats.info}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex space-x-2 bg-bg-card p-1 border-4 border-border">
          {[
            { id: 'all', label: '全部' },
            { id: 'error', label: '错误' },
            { id: 'warn', label: '警告' },
            { id: 'info', label: '信息' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => handleFilterChange(type.id)}
              className={`px-4 py-2 text-sm font-pixel-title transition-colors ${
                filter === type.id
                  ? 'bg-pixel-primary text-white border-4 border-pixel-primary-dark'
                  : 'text-pixel-gray hover:text-white'
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
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-bg-input border-4 border-border text-sm text-white placeholder-pixel-gray focus:outline-none focus:border-pixel-border-highlight transition-colors font-pixel-body"
          />
          <span className="absolute left-3 top-2.5 text-pixel-gray">🔍</span>
        </div>
      </div>

      {/* Logs List - 像素风格 */}
      <div className="bg-bg-card border-4 border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-pixel-gray font-pixel-body">正在加载日志...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white font-pixel-title">未找到日志</p>
            <p className="text-pixel-gray text-sm mt-1 font-pixel-body">尝试调整筛选条件。</p>
          </div>
        ) : (
          <div className="divide-y-4 divide-border">
            {filteredLogs.map((log, index) => (
              <div key={log.id || index} className="p-4 hover:bg-bg-secondary transition-colors flex items-start space-x-4">
                <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-pixel-title uppercase tracking-wide border-4 ${getLevelColor(log.level)}`}>
                  {log.level}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm font-pixel-body text-white truncate pr-4">
                      {log.agent_id ? `[${log.agent_id}] ` : ''}{log.message}
                    </p>
                    <span className="text-xs text-pixel-gray whitespace-nowrap font-mono">
                      {new Date(log.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  {log.details && (
                    <pre className="mt-2 p-3 bg-bg-input text-xs font-mono text-pixel-gray overflow-x-auto border-4 border-border">
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
