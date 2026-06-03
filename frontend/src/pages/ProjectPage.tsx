// src/pages/ProjectPage.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import { ConfirmModal } from '../components/ConfirmModal';
import apiClient from '../services/apiClient';
import type { Project, Task, TaskStatus } from '../interfaces';

const STATUS_COLUMNS: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const nextStatus = (current: TaskStatus): TaskStatus => {
  switch (current) {
    case 'To Do':
      return 'In Progress';
    case 'In Progress':
      return 'Done';
    case 'Done':
      return 'To Do';
  }
};

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Create task modal
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createStatus, setCreateStatus] = useState<TaskStatus>('To Do');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit task modal
  const [showEditTask, setShowEditTask] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('To Do');
  const [editTaskLoading, setEditTaskLoading] = useState(false);

  // Edit project modal
  const [showEditProject, setShowEditProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectLoading, setEditProjectLoading] = useState(false);

  // Delete confirms
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [showDeleteTask, setShowDeleteTask] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  if (!auth) {
    throw new Error('ProjectPage must be used within an AuthProvider');
  }

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        apiClient.get<{ data: Project }>(`/projects/${projectId}`),
        apiClient.get<Task[]>(`/projects/${projectId}/tasks`),
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data);
      setError('');
    } catch {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  // --- Task CRUD ---

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await apiClient.post<Task>(`/projects/${projectId}/tasks`, {
        title: createTitle,
        description: createDescription,
        status: createStatus,
      });
      setTasks((prev) => [...prev, res.data]);
      setShowCreateTask(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateStatus('To Do');
    } catch {
      setError('Failed to create task');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditTask = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setShowEditTask(true);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    setEditTaskLoading(true);
    try {
      const res = await apiClient.put<Task>(`/tasks/${editTask._id}`, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === editTask._id ? res.data : t))
      );
      setShowEditTask(false);
      setEditTask(null);
    } catch {
      setError('Failed to update task');
    } finally {
      setEditTaskLoading(false);
    }
  };

  const handleMoveTask = async (task: Task) => {
    const newStatus = nextStatus(task.status);
    try {
      const res = await apiClient.put<Task>(`/tasks/${task._id}`, {
        status: newStatus,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data : t))
      );
    } catch {
      setError('Failed to move task');
    }
  };

  const openDeleteTask = (taskId: string) => {
    setDeleteTaskId(taskId);
    setShowDeleteTask(true);
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      await apiClient.delete(`/tasks/${deleteTaskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== deleteTaskId));
      setShowDeleteTask(false);
      setDeleteTaskId(null);
    } catch {
      setError('Failed to delete task');
    }
  };

  // --- Project Edit/Delete ---

  const openEditProject = () => {
    if (!project) return;
    setEditProjectName(project.name);
    setEditProjectDescription(project.description);
    setShowEditProject(true);
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProjectLoading(true);
    try {
      const res = await apiClient.put<{ success: boolean; data: Project }>(
        `/projects/${projectId}`,
        { name: editProjectName, description: editProjectDescription }
      );
      setProject(res.data.data);
      setShowEditProject(false);
    } catch {
      setError('Failed to update project');
    } finally {
      setEditProjectLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await apiClient.delete(`/projects/${projectId}`);
      navigate('/dashboard');
    } catch {
      setError('Failed to delete project');
    }
  };

  const getMoveLabel = (status: TaskStatus): string => {
    switch (status) {
      case 'To Do':
        return '→ In Progress';
      case 'In Progress':
        return '→ Done';
      case 'Done':
        return '→ To Do';
    }
  };

  if (loading) {
    return (
      <div className="page-layout">
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/dashboard" className="navbar-brand">
              <span className="navbar-brand-icon">🚀</span> Pro-Tasker
            </Link>
          </div>
        </nav>
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="page-layout">
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/dashboard" className="navbar-brand">
              <span className="navbar-brand-icon">🚀</span> Pro-Tasker
            </Link>
          </div>
        </nav>
        <div className="container">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              id="back-to-dashboard-error-btn"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/dashboard" className="navbar-brand">
            <span className="navbar-brand-icon">🚀</span> Pro-Tasker
          </Link>

          <button
            id="project-menu-toggle-btn"
            className="navbar-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
            <span className="navbar-user">
              Hi, <strong>{auth.user?.username}</strong>
            </span>
            <button
              id="project-logout-btn"
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Header */}
        <div className="page-header">
          <div>
            <button
              id="back-to-dashboard-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/dashboard')}
            >
              ← Back
            </button>
            <h1 className="page-title">{project?.name}</h1>
            <p className="page-subtitle">{project?.description}</p>
          </div>
          <div className="card-actions">
            <button
              id="edit-project-btn"
              className="btn btn-secondary btn-sm"
              onClick={openEditProject}
            >
              ✏️ Edit Project
            </button>
            <button
              id="delete-project-btn"
              className="btn btn-danger btn-sm"
              onClick={() => setShowDeleteProject(true)}
            >
              🗑️ Delete Project
            </button>
            <button
              id="add-task-btn"
              className="btn btn-primary"
              onClick={() => setShowCreateTask(true)}
            >
              + Add Task
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="kanban-board">
          {STATUS_COLUMNS.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{status}</span>
                  <span className="kanban-column-count">{columnTasks.length}</span>
                </div>
                <div className="kanban-cards">
                  {columnTasks.length === 0 ? (
                    <div className="kanban-empty">No tasks</div>
                  ) : (
                    columnTasks.map((task) => (
                      <div key={task._id} className="task-card">
                        <div className="task-card-header">
                          <h4
                            className="task-card-title"
                            onClick={() => openEditTask(task)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') openEditTask(task);
                            }}
                          >
                            {task.title}
                          </h4>
                          <button
                            id={`delete-task-${task._id}`}
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => openDeleteTask(task._id)}
                            aria-label="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                        {task.description && (
                          <p className="task-card-desc">{task.description}</p>
                        )}
                        <div className="task-card-footer">
                          <Badge status={task.status} />
                          <div className="task-card-actions">
                            <button
                              id={`move-task-${task._id}`}
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleMoveTask(task)}
                            >
                              {getMoveLabel(task.status)}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="modal-overlay" onClick={() => setShowCreateTask(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="create-task-title" className="form-label">
                  Title
                </label>
                <input
                  id="create-task-title"
                  className="form-input"
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-task-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="create-task-description"
                  className="form-input"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-task-status" className="form-label">
                  Status
                </label>
                <select
                  id="create-task-status"
                  className="form-select"
                  value={createStatus}
                  onChange={(e) => setCreateStatus(e.target.value as TaskStatus)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  id="cancel-create-task-btn"
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-create-task-btn"
                  className="btn btn-primary"
                  type="submit"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTask && (
        <div className="modal-overlay" onClick={() => setShowEditTask(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Task</h2>
            <form onSubmit={handleEditTask}>
              <div className="form-group">
                <label htmlFor="edit-task-title" className="form-label">
                  Title
                </label>
                <input
                  id="edit-task-title"
                  className="form-input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-task-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="edit-task-description"
                  className="form-input"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-task-status" className="form-label">
                  Status
                </label>
                <select
                  id="edit-task-status"
                  className="form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  id="cancel-edit-task-btn"
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowEditTask(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-edit-task-btn"
                  className="btn btn-primary"
                  type="submit"
                  disabled={editTaskLoading}
                >
                  {editTaskLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && (
        <div className="modal-overlay" onClick={() => setShowEditProject(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Project</h2>
            <form onSubmit={handleEditProject}>
              <div className="form-group">
                <label htmlFor="edit-proj-name" className="form-label">
                  Project Name
                </label>
                <input
                  id="edit-proj-name"
                  className="form-input"
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-proj-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="edit-proj-description"
                  className="form-input"
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button
                  id="cancel-edit-project-btn"
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowEditProject(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-edit-project-btn"
                  className="btn btn-primary"
                  type="submit"
                  disabled={editProjectLoading}
                >
                  {editProjectLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirm */}
      <ConfirmModal
        isOpen={showDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteTask}
        onCancel={() => {
          setShowDeleteTask(false);
          setDeleteTaskId(null);
        }}
      />

      {/* Delete Project Confirm */}
      <ConfirmModal
        isOpen={showDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project and all its tasks? This action cannot be undone."
        confirmLabel="Delete Project"
        variant="danger"
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteProject(false)}
      />
    </div>
  );
};