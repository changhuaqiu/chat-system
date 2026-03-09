import React, { useState } from 'react';

/**
 * 任务卡片组件
 */
const TaskCard = ({ task, onStatusChange, onClick }) => {
  const [isDragging, setIsDragging] = useState(false);

  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/10',
    medium: 'border-amber-500/50 bg-amber-500/10',
    low: 'border-emerald-500/50 bg-emerald-500/10'
  };

  const statusColors = {
    todo: 'bg-gray-500/20 text-gray-300',
    inProgress: 'bg-blue-500/20 text-blue-300',
    done: 'bg-emerald-500/20 text-emerald-300'
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick && onClick(task)}
      className={`p-4 rounded-xl border backdrop-blur-sm cursor-grab active:cursor-grabbing
        transition-all duration-300 hover:shadow-lg ${
          isDragging ? 'opacity-50 scale-105' : 'opacity-100'
        } ${priorityColors[task.priority] || priorityColors.low}`}
    >
      {/* 标题 */}
      <h4 className="text-sm font-medium text-white mb-2">{task.title}</h4>

      {/* 描述 */}
      {task.description && (
        <p className="text-xs text-white/50 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* 负责人 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-xs text-white font-medium">
            {task.assignee?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs text-white/60">{task.assignee?.name || '未分配'}</span>
        </div>

        {/* 截止日期 */}
        {task.dueDate && (
          <span className="text-xs text-white/40 flex items-center gap-1">
            <i className="ri-calendar-line" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* 状态标签 */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[task.status]}`}>
          {task.status === 'todo' && '待办'}
          {task.status === 'inProgress' && '进行中'}
          {task.status === 'done' && '已完成'}
        </span>

        {/* 优先级指示器 */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/40">优先级</span>
          <div className="flex items-center gap-0.5">
            <div
              className={`w-2 h-2 rounded-full ${
                task.priority === 'high'
                  ? 'bg-red-500'
                  : task.priority === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 任务列组件
 */
const TaskColumn = ({ title, count, color, children, onDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    onDrop && onDrop(taskId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[280px] rounded-2xl p-4 transition-all ${
        isDragOver ? 'bg-purple-500/20 border-2 border-purple-500/50' : 'bg-white/5 border border-white/10'
      }`}
    >
      {/* 列头 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">
            {count}
          </span>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
          <i className="ri-add-line" />
        </button>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">{children}</div>
    </div>
  );
};

/**
 * 协作任务看板
 */
const TaskBoard = ({ tasks = [], onTaskUpdate, onClose }) => {
  const [selectedTask, setSelectedTask] = useState(null);

  // 按状态分组任务
  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    inProgress: tasks.filter((t) => t.status === 'inProgress'),
    done: tasks.filter((t) => t.status === 'done')
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleStatusChange = (taskId, newStatus) => {
    onTaskUpdate && onTaskUpdate({ ...tasks.find((t) => t.id === taskId), status: newStatus });
  };

  const handleDrop = (taskId, newStatus) => {
    handleStatusChange(taskId, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-gray-900/90 rounded-2xl shadow-2xl border border-white/10 overflow-hidden fade-in-scale">
        {/* 头部 */}
        <div className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="ri-list-check-2 text-purple-400 text-xl" />
            <h2 className="text-lg font-semibold text-white">任务看板</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 btn-primary text-white rounded-xl text-sm font-medium flex items-center gap-2">
              <i className="ri-add-line" />
              新建任务
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl btn-secondary text-white/60 hover:text-white transition-all"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        </div>

        {/* 看板内容 */}
        <div className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {/* 待办 */}
            <TaskColumn
              title="待办"
              count={tasksByStatus.todo.length}
              color="bg-gray-500"
              onDrop={(taskId) => handleDrop(taskId, 'todo')}
            >
              {tasksByStatus.todo.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </TaskColumn>

            {/* 进行中 */}
            <TaskColumn
              title="进行中"
              count={tasksByStatus.inProgress.length}
              color="bg-blue-500"
              onDrop={(taskId) => handleDrop(taskId, 'inProgress')}
            >
              {tasksByStatus.inProgress.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </TaskColumn>

            {/* 已完成 */}
            <TaskColumn
              title="已完成"
              count={tasksByStatus.done.length}
              color="bg-emerald-500"
              onDrop={(taskId) => handleDrop(taskId, 'done')}
            >
              {tasksByStatus.done.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </TaskColumn>
          </div>
        </div>
      </div>

      {/* 任务详情弹窗 */}
      {selectedTask && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden fade-in-scale">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{selectedTask.title}</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/60 transition-all"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>
              <p className="text-white/70 mb-4">{selectedTask.description}</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>负责人：{selectedTask.assignee?.name || '未分配'}</span>
                <span>截止：{new Date(selectedTask.dueDate || '').toLocaleDateString()}</span>
              </div>
            </div>
            <div className="glass-panel border-t border-white/5 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 btn-secondary text-white/70 rounded-xl font-medium"
              >
                取消
              </button>
              <button className="px-4 py-2 btn-primary text-white rounded-xl font-medium">
                编辑任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
export { TaskCard, TaskColumn };
