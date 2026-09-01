import React, { useState } from 'react';
import { Plus, Trash2, Check, ArrowUpRight } from 'lucide-react';
import { Task, Priority } from '../types';

interface TodoListCardProps {
  tasks: Task[];
  onAddTask: (title: string, priority: Priority, category?: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTaskForFocus: (taskTitle: string) => void;
}

export const TodoListCard: React.FC<TodoListCardProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onSelectTaskForFocus,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), priority);
    setNewTaskTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateTask();
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="blueprint-card todo-card-container" id="todo-card">
      <div className="blueprint-card-header">
        <h2 className="blueprint-card-title">To-Do-List</h2>
        <span className="blueprint-card-badge">
          {completedCount} / {tasks.length} DONE
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="todo-filter-bar">
        <button
          className={`todo-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ALL ({tasks.length})
        </button>
        <button
          className={`todo-filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          ACTIVE ({tasks.length - completedCount})
        </button>
        <button
          className={`todo-filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          DONE ({completedCount})
        </button>
      </div>

      {/* Task List */}
      <div className="todo-list-scroll">
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
            {filter === 'completed' ? 'NO COMPLETED TASKS YET' : 'NO TASKS YET. TYPE BELOW TO ADD ONE.'}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`todo-item ${task.completed ? 'completed' : ''}`}
              id={`task-item-${task.id}`}
            >
              <div className="todo-item-left">
                <div
                  className={`geo-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => onToggleTask(task.id)}
                  title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {task.completed && <Check size={12} strokeWidth={3} />}
                </div>

                <span className="todo-title" title={task.title}>
                  {task.title}
                </span>
              </div>

              <div className="todo-actions">
                <span className={`priority-tag priority-${task.priority}`}>
                  {task.priority.substring(0, 3)}
                </span>

                {!task.completed && (
                  <button
                    className="todo-icon-btn"
                    onClick={() => onSelectTaskForFocus(task.title)}
                    title="Focus on this task with timer"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                )}

                <button
                  className="todo-icon-btn"
                  onClick={() => onDeleteTask(task.id)}
                  title="Delete task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Bar & Priority Selector */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          type="text"
          id="new-task-input"
          className="geo-input"
          placeholder="New task... (Press Enter)"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />
        
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="geo-btn geo-btn-sm"
          style={{ padding: '7px 4px', fontSize: '0.72rem' }}
          title="Select Priority"
        >
          <option value="high">HIGH</option>
          <option value="medium">MED</option>
          <option value="low">LOW</option>
        </select>
      </div>

      {/* Add Button Box (Blueprint) */}
      <div className="sub-action-box" style={{ padding: 0, border: 'none' }}>
        <button
          className="geo-btn geo-btn-primary"
          style={{ width: '100%', padding: '10px' }}
          onClick={handleCreateTask}
          id="add-task-btn"
        >
          <Plus size={15} />
          ADD / CREATE TASK
        </button>
      </div>
    </div>
  );
};
