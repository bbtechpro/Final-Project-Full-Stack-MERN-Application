// src/pages/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import apiClient from '../services/apiClient';
import type { Project, Task } from '../interfaces';

interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [taskSummaries, setTaskSummaries] = useState<Record<string, TaskSummary>>({});

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  if (!auth) {
    throw new Error('Dashboard must be used within an AuthProvider');
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ success: boolean; data: Project[] }>('/projects');
      const loadedProjects = res.data.data;
      setProjects(loadedProjects);
      setError('');

      // Fetch task summaries for all projects in parallel
      const summaryEntries = await Promise.all(
        loadedProjects.map(async (project) => {
          try {
            const taskRes = await apiClient.get<Task[]>(`/projects/${project._id}/tasks`);
            const tasks = taskRes.data;
            const summary: TaskSummary = {
              total: tasks.length,
              todo: tasks.filter((t) => t.status === 'To Do').length,
              inProgress: tasks.filter((t) => t.status === 'In Progress').length,
              done: tasks.filter((t) => t.status === 'Done').length,
            };
            return [project._id, summary] as const;
          } catch {
            return [project._id, { total: 0, todo: 0, inProgress: 0, done: 0 }] as const;
          }
        })
      );
      setTaskSummaries(Object.fromEntries(summaryEntries));
    } catch {
      setError('Failed to load projects');
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

  const handleCreateProject = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await apiClient.post<{ success: boolean; data: Project }>('/projects', {
        name: createName,
        description: createDescription,
      });
      setProjects((prev) => [...prev, res.data.data]);
      setShowCreateModal(false);
      setCreateName('');
      setCreateDescription('');
    } catch {
      setError('Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (project: Project) => {
    setEditProject(project);
    setEditName(project.name);
    setEditDescription(project.description);
    setShowEditModal(true);
  };

  const handleEditProject = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editProject) return;
    setEditLoading(true);
    try {
      const res = await apiClient.put<{ success: boolean; data: Project }>(
        `/projects/${editProject._id}`,
        { name: editName, description: editDescription }
      );
      setProjects((prev) =>
        prev.map((p) => (p._id === editProject._id ? res.data.data : p))
      );
      setShowEditModal(false);
      setEditProject(null);
    } catch {
      setError('Failed to update project');
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteConfirm = (projectId: string) => {
    setDeleteProjectId(projectId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    try {
      await apiClient.delete(`/projects/${deleteProjectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== deleteProjectId));
      const newSummaries = { ...taskSummaries };
      delete newSummaries[deleteProjectId];
      setTaskSummaries(newSummaries);
      setShowDeleteConfirm(false);
      setDeleteProjectId(null);
    } catch {
      setError('Failed to delete project');
    }
  };

  const getDeleteWarningMessage = (): string => {
    if (!deleteProjectId) return '';
    const summary = taskSummaries[deleteProjectId];
    if (!summary || summary.total === 0) {
      return 'Are you sure you want to delete this project? This action cannot be undone.';
    }
    const incomplete = summary.todo + summary.inProgress;
    if (incomplete > 0) {
      return `⚠️ This project has ${incomplete} incomplete task${incomplete !== 1 ? 's' : ''} (${summary.todo} To Do, ${summary.inProgress} In Progress). Deleting this project will remove all ${summary.total} task${summary.total !== 1 ? 's' : ''}. This action cannot be undone.`;
    }
    return `This project has ${summary.total} completed task${summary.total !== 1 ? 's' : ''}. Deleting this project will remove all tasks. This action cannot be undone.`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/dashboard" className="navbar-brand">
            <span className="navbar-brand-icon"></span> Pro-Tasker
          </Link>

          <button
            id="menu-toggle-btn"
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
              id="logout-btn"
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Projects</h1>
            <p className="page-subtitle">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <button
            id="new-project-btn"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Project
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
            <button
              id="empty-new-project-btn"
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => {
              const summary = taskSummaries[project._id];
              const hasTasks = summary && summary.total > 0;
              return (
                <div
                  key={project._id}
                  className="card"
                  onClick={() => navigate(`/projects/${project._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/projects/${project._id}`);
                  }}
                >
                  <div className="card-header">
                    <h3 className="card-title">{project.name}</h3>
                  </div>
                  <p className="card-description">{project.description}</p>

                  {/* Task status summary */}
                  {hasTasks ? (
                    <div className="card-task-summary">
                      <div className="task-progress-bar">
                        {summary.done > 0 && (
                          <div
                            className="task-progress-segment task-progress-done"
                            style={{ width: `${(summary.done / summary.total) * 100}%` }}
                          />
                        )}
                        {summary.inProgress > 0 && (
                          <div
                            className="task-progress-segment task-progress-in-progress"
                            style={{ width: `${(summary.inProgress / summary.total) * 100}%` }}
                          />
                        )}
                        {summary.todo > 0 && (
                          <div
                            className="task-progress-segment task-progress-todo"
                            style={{ width: `${(summary.todo / summary.total) * 100}%` }}
                          />
                        )}
                      </div>
                      <div className="task-status-counts">
                        {summary.todo > 0 && (
                          <span className="task-count task-count-todo">
                            {summary.todo} To Do
                          </span>
                        )}
                        {summary.inProgress > 0 && (
                          <span className="task-count task-count-in-progress">
                            {summary.inProgress} In Progress
                          </span>
                        )}
                        {summary.done > 0 && (
                          <span className="task-count task-count-done">
                            {summary.done} Done
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="card-no-tasks-hint">
                      <span>📋</span> Click to add your first task
                    </div>
                  )}

                  <div className="card-footer">
                    <span className="card-meta">
                      Created {formatDate(project.createdAt)}
                    </span>
                    <div className="card-actions">
                      <button
                        id={`edit-project-${project._id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(project);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        id={`delete-project-${project._id}`}
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(project._id);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="create-project-name" className="form-label">
                  Project Name
                </label>
                <input
                  id="create-project-name"
                  className="form-input"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-project-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="create-project-description"
                  className="form-input"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button
                  id="cancel-create-btn"
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-create-btn"
                  className="btn btn-primary"
                  type="submit"
                  disabled={createLoading}
                >
                  {createLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Project</h2>
            <form onSubmit={handleEditProject}>
              <div className="form-group">
                <label htmlFor="edit-project-name" className="form-label">
                  Project Name
                </label>
                <input
                  id="edit-project-name"
                  className="form-input"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-project-description" className="form-label">
                  Description
                </label>
                <textarea
                  id="edit-project-description"
                  className="form-input"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button
                  id="cancel-edit-btn"
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-edit-btn"
                  className="btn btn-primary"
                  type="submit"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Project"
        message={getDeleteWarningMessage()}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteProject}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteProjectId(null);
        }}
      />
    </div>
  );
};
