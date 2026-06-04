// src/pages/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import apiClient from '../services/apiClient';
import type { Project, Task, ProjectStatus } from '../interfaces';

interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

type FilterTab = 'active' | 'completed' | 'all';

export const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [taskSummaries, setTaskSummaries] = useState<Record<string, TaskSummary>>({});
  const [activeFilter, setActiveFilter] = useState<FilterTab>('active');

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
      navigate('/');
    } catch {
      navigate('/');
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

  const handleToggleStatus = async (project: Project) => {
    const newStatus: ProjectStatus = project.status === 'completed' ? 'active' : 'completed';
    try {
      const res = await apiClient.patch<{ success: boolean; data: Project }>(
        `/projects/${project._id}/status`,
        { status: newStatus }
      );
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? res.data.data : p))
      );
    } catch {
      setError('Failed to update project status');
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
      return `\u26a0\ufe0f This project has ${incomplete} incomplete task${incomplete !== 1 ? 's' : ''} (${summary.todo} To Do, ${summary.inProgress} In Progress). Deleting this project will remove all ${summary.total} task${summary.total !== 1 ? 's' : ''}. This action cannot be undone.`;
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

  const activeProjects = projects
    .filter((p) => (p.status || 'active') === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const completedProjects = projects
    .filter((p) => p.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

  const activeProjectsToRender = activeFilter === 'completed' ? [] : activeProjects;
  const completedProjectsToRender = activeFilter === 'active' ? [] : completedProjects;

  const activeCount = activeProjects.length;
  const completedCount = completedProjects.length;

  const totalMatching = activeProjectsToRender.length + completedProjectsToRender.length;
  const showActiveSection = activeFilter !== 'completed' && (activeProjects.length > 0 || activeFilter === 'active');
  const showCompletedSection = activeFilter !== 'active' && (completedProjects.length > 0 || activeFilter === 'completed');

  const renderProjectCards = (projectList: Project[]) => (
    <div className="project-grid">
      {projectList.map((project) => {
        const summary = taskSummaries[project._id];
        const hasTasks = summary && summary.total > 0;
        const isCompleted = project.status === 'completed';
        return (
          <div
            key={project._id}
            className={`card${isCompleted ? ' card-completed' : ''}`}
            onClick={() => navigate(`/projects/${project._id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(`/projects/${project._id}`);
            }}
          >
            <div className="card-header">
              <h3 className={`card-title${isCompleted ? ' text-strikethrough' : ''}`}>
                {project.name}
              </h3>
              {isCompleted && (
                <span className="badge badge-done">✓ Complete</span>
              )}
            </div>
            <p className={`card-description${isCompleted ? ' text-strikethrough' : ''}`}>
              {project.description}
            </p>

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
              !isCompleted && (
                <div className="card-no-tasks-hint">
                  <span>📋</span> Click this card to add your first task
                </div>
              )
            )}

            <div className="card-footer">
              <span className="card-meta">
                {isCompleted && project.completedAt
                  ? `Completed ${formatDate(project.completedAt)}`
                  : `Created ${formatDate(project.createdAt)}`}
              </span>
              <div className="card-actions">
                <button
                  id={`toggle-status-${project._id}`}
                  className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-success'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(project);
                  }}
                >
                  {isCompleted ? '↩️ Reopen' : '✅ Complete'}
                </button>
                {!isCompleted && (
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
                )}
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
  );

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

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            id="filter-active-btn"
            className={`filter-tab${activeFilter === 'active' ? ' filter-tab-active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            📂 In Progress ({activeCount})
          </button>
          <button
            id="filter-completed-btn"
            className={`filter-tab${activeFilter === 'completed' ? ' filter-tab-active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            ✅ Completed ({completedCount})
          </button>
          <button
            id="filter-all-btn"
            className={`filter-tab${activeFilter === 'all' ? ' filter-tab-active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All ({projects.length})
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading projects...</p>
          </div>
        ) : totalMatching === 0 ? (
          <div className="empty-state">
            {activeFilter === 'completed' ? (
              <p>No completed projects yet. Mark a project complete to build your history.</p>
            ) : activeFilter === 'active' ? (
              <p>No active projects right now. Create one or reopen a completed project.</p>
            ) : (
              <>
                <p>No projects yet. Create your first project to get started!</p>
                <button
                  id="empty-new-project-btn"
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Project
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {showActiveSection && (
              <section className="dashboard-section">
                <div className="section-heading">
                  <div>
                    <h2>In Progress</h2>
                    <p>{activeProjects.length} {activeProjects.length === 1 ? 'project' : 'projects'} currently in progress</p>
                  </div>
                </div>
                {activeProjectsToRender.length > 0 ? (
                  renderProjectCards(activeProjectsToRender)
                ) : (
                  <div className="empty-state">
                    <p>No active projects to show.</p>
                  </div>
                )}
              </section>
            )}

            {showCompletedSection && (
              <section className="dashboard-section completed-history-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      Completed History
                      <span className="section-badge">History</span>
                    </h2>
                    <p>{completedProjects.length} completed {completedProjects.length === 1 ? 'project' : 'projects'}</p>
                  </div>
                </div>
                {completedProjectsToRender.length > 0 ? (
                  renderProjectCards(completedProjectsToRender)
                ) : (
                  <div className="empty-state">
                    <p>No completed projects yet.</p>
                  </div>
                )}
              </section>
            )}
          </>
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
