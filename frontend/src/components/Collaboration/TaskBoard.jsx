import React, { useState } from 'react';

/**
 * 任务卡片组件 - 像素风格
 */
const TaskCard = ({ task, onStatusChange, onClick }) => {
  const [isDragging, setIsDragging] = useState(false);

  const priorityColors = {
    high: 'border-pixel-accent-pink bg-pixel-accent-pink/20',
    medium: 'border-pixel-accent-orange bg-pixel-accent-orange/20',
    low: 'border-pixel-accent-green bg-pixel-accent-green/20'
  };

  const statusColors = {
    todo: 'bg-bg-secondary text-pixel-gray',
    inProgress: 'bg-pixel-accent-cyan/20 text-pixel-accent-cyan',
    done: 'bg-pixel-accent-green/20 text-pixel-accent-green'
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
      className={`p-4 border-4 cursor-grab active:cursor-grabbing
        transition-colors ${
          isDragging ? 'opacity-50' : 'opacity-100'
        } ${priorityColors[task.priority] || priorityColors.low}`}
    >
      {/* 标题 */}
      <h4 className="text-sm font-pixel-title text-white mb-2">{task.title}</h4>

      {/* 描述 */}
      {task.description && (
        <p className="text-xs text-pixel-gray mb-3 line-clamp-2 font-pixel-body">{task.description}</p>
      )}

      {/* 负责人 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-4 border-pixel-accent-purple bg-pixel-accent-purple flex items-center justify-center text-xs text-white font-pixel-title">
            {task.assignee?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-xs text-pixel-gray font-pixel-body">{task.assignee?.name || '未分配'}</span>
        </div>

        {/* 截止日期 */}
        {task.dueDate && (
          <span className="text-xs text-pixel-gray flex items-center gap-1 font-pixel-body">
            <i className="ri-calendar-line" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* 状态标签 */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 border-4 text-xs font-pixel-body ${statusColors[task.status]}`}>
          {task.status === 'todo' && '待办'}
          {task.status === 'inProgress' && '进行中'}
          {task.status === 'done' && '已完成'}
        </span>

        {/* 优先级指示器 */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-pixel-gray font-pixel-body">优先级</span>
          <div className="flex items-center gap-0.5">
            <div
              className={`w-3 h-3 border-2 ${
                task.priority === 'high'
                  ? 'border-pixel-accent-pink bg-pixel-accent-pink'
                  : task.priority === 'medium'
                  ? 'border-pixel-accent-orange bg-pixel-accent-orange'
                  : 'border-pixel-accent-green bg-pixel-accent-green'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 任务列组件 - 像素风格
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
      className={`flex-1 min-w-[280px] p-4 transition-colors ${
        isDragOver ? 'bg-pixel-accent-purple/20 border-4 border-pixel-accent-purple' : 'bg-bg-secondary border-4 border-border'
      }`}
    >
      {/* 列头 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 border-2 ${color}`} />
          <h3 className="text-sm font-pixel-title text-white">{title}</h3>
          <span className="px-2 py-0.5 border-2 border-border bg-bg-card text-pixel-gray text-xs font-pixel-body">
            {count}
          </span>
        </div>
        <button className="p-1.5 border-2 border-transparent hover:border-pixel-primary text-pixel-gray hover:text-white transition-colors">
          <i className="ri-add-line" />
        </button>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">{children}</div>
    </div>
  );
};

/**
 * 协作任务看板 - 像素风格
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80">
      <div className="w-full max-w-5xl bg-bg-card border-8 border-border shadow-pixel-xl overflow-hidden fade-in-scale">
        {/* 头部 */}
        <div className="bg-bg-card border-b-4 border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="ri-list-check-2 text-pixel-accent-purple text-xl" />
            <h2 className="text-lg font-pixel-title text-white">任务看板</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border-4 border-pixel-primary bg-pixel-primary text-white text-sm font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple flex items-center gap-2 transition-colors">
              <i className="ri-add-line" />
              新建任务
            </button>
            <button
              onClick={onClose}
              className="p-2 border-4 border-border text-pixel-gray hover:text-white hover:border-pixel-primary transition-colors"
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
              color="border-pixel-gray bg-pixel-gray"
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
              color="border-pixel-accent-cyan bg-pixel-accent-cyan"
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
              color="border-pixel-accent-green bg-pixel-accent-green"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center p-8 bg-black/80">
          <div className="w-full max-w-lg bg-bg-card border-8 border-border shadow-pixel-xl overflow-hidden fade-in-scale">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-pixel-title text-white">{selectedTask.title}</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 border-2 border-transparent hover:border-pixel-primary text-pixel-gray hover:text-white transition-colors"
                >
                  <i className="ri-close-line text-xl" />
                </button>
              </div>
              <p className="text-white font-pixel-body mb-4">{selectedTask.description}</p>
              <div className="flex items-center gap-4 text-sm text-pixel-gray font-pixel-body">
                <span>负责人：{selectedTask.assignee?.name || '未分配'}</span>
                <span>截止：{new Date(selectedTask.dueDate || '').toLocaleDateString()}</span>
              </div>
            </div>
            <div className="bg-bg-card border-t-4 border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 border-4 border-border text-pixel-gray font-pixel-body hover:bg-bg-secondary transition-colors"
              >
                取消
              </button>
              <button className="px-4 py-2 border-4 border-pixel-primary bg-pixel-primary text-white font-pixel-body hover:bg-pixel-accent-purple hover:border-pixel-accent-purple transition-colors">
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
