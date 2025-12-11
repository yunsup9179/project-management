import React, { useEffect, useState } from 'react';
import { ProjectSummary, fetchAllProjects, deleteProject } from '../services/projectService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProjectListProps {
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  currentProjectId?: string;
}

export default function ProjectList({ onSelectProject, onNewProject, currentProjectId }: ProjectListProps) {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Please set up .env file.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllProjects();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      if (currentProjectId === id) {
        onNewProject();
      }
    } catch (err) {
      alert('Failed to delete project');
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="project-list">
        <div className="list-header">
          <h2>My Projects</h2>
        </div>
        <div className="setup-warning">
          <h3>⚙️ Supabase Not Configured</h3>
          <p>To enable project saving and loading:</p>
          <ol>
            <li>Create a Supabase account at <a href="https://supabase.com" target="_blank">supabase.com</a></li>
            <li>Follow instructions in <code>SUPABASE_SETUP.md</code></li>
            <li>Create a <code>.env</code> file with your credentials</li>
            <li>Restart the dev server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="project-list">
      <div className="list-header">
        <h2>My Projects</h2>
        {isAdmin && (
          <button className="btn-new-project" onClick={onNewProject}>+ New Project</button>
        )}
      </div>

      {loading && <div className="loading">Loading projects...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div className="empty-state">
          <p>No projects yet. Click "New Project" to get started!</p>
        </div>
      )}

      <div className="projects-grid">
        {projects.map(project => (
          <div
            key={project.id}
            className={`project-card ${currentProjectId === project.id ? 'active' : ''}`}
          >
            <div className="project-card-content" onClick={() => onSelectProject(project.id)}>
              <h3>{project.name}</h3>
              <p className="client-name">{project.client}</p>
              <div className="project-meta">
                <span className="task-count">{project.taskCount} tasks</span>
                <span className="updated-date">Updated {formatDate(project.updated_at)}</span>
              </div>
            </div>
            {isAdmin && (
              <div className="project-actions">
                <button
                  className="btn-delete-project"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project.id, project.name);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
