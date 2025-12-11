import React, { useState } from 'react';
import { Project, Phase, Task, CustomField } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';
import ColumnManager from './ColumnManager';
import TaskTable from './TaskTable';
import GanttChart from './GanttChart';
import { exportProjectAsJSON } from '../utils/storage';
import { createProject, updateProject, fetchProject } from '../services/projectService';
import { isSupabaseConfigured } from '../lib/supabase';
import '../styles/App.css';
import '../styles/print.css';

const DEFAULT_PHASES: Phase[] = [
  { id: '1', name: 'Contract & Design', color: '#3b82f6' },
  { id: '2', name: 'Permitting', color: '#f59e0b' },
  { id: '3', name: 'Construction & Execution', color: '#10b981' }
];

function App() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [showProjectList, setShowProjectList] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load project from Supabase
  const loadProject = async (id: string) => {
    try {
      const project = await fetchProject(id);
      if (project) {
        setCurrentProjectId(project.id);
        setProjectName(project.name);
        setClientName(project.client);
        setCustomFields(project.customFields);
        setPhases(project.phases.length > 0 ? project.phases : DEFAULT_PHASES);
        setTasks(project.tasks);
        // Automatically show chart if project has tasks
        setShowChart(project.tasks.length > 0);
        setShowProjectList(false);
      }
    } catch (err) {
      alert('Failed to load project');
      console.error(err);
    }
  };

  // Create new project (clear form)
  const handleNewProject = () => {
    setCurrentProjectId(null);
    setProjectName('');
    setClientName('');
    setCustomFields([]);
    setPhases(DEFAULT_PHASES);
    setTasks([]);
    setShowChart(false);
    setShowProjectList(false);
  };

  // Save project to Supabase
  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    if (!isSupabaseConfigured) {
      alert('Supabase is not configured. Please set up .env file.');
      return;
    }

    if (!user) {
      alert('You must be logged in to save projects');
      return;
    }

    try {
      setIsSaving(true);

      const projectData = {
        name: projectName,
        client: clientName,
        customFields,
        phases,
        tasks
      };

      if (currentProjectId) {
        // Update existing project
        const updated = await updateProject(currentProjectId, projectData);
        if (updated) {
          alert('Project updated successfully!');
          // Auto-show chart if there are tasks
          if (tasks.length > 0) {
            setShowChart(true);
          }
        }
      } else {
        // Create new project
        const created = await createProject(projectData, user.id);
        if (created) {
          setCurrentProjectId(created.id);
          alert('Project saved successfully!');
          // Auto-show chart if there are tasks
          if (tasks.length > 0) {
            setShowChart(true);
          }
        }
      }
    } catch (err) {
      alert('Failed to save project');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    const project: Project = {
      id: currentProjectId || Date.now().toString(),
      name: projectName,
      client: clientName,
      createdAt: new Date().toISOString(),
      customFields,
      phases,
      tasks
    };
    exportProjectAsJSON(project);
  };

  const handleGenerateChart = () => {
    if (!projectName || tasks.length === 0) {
      alert('Please add project name and at least one task');
      return;
    }
    setShowChart(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAuthSuccess = () => {
    // Auth context will automatically update user state
  };

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not logged in
  if (!user) {
    return (
      <div className="app">
        {authMode === 'login' ? (
          <Login
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setAuthMode('signup')}
          />
        ) : (
          <Signup
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    );
  }

  // Main app (user is logged in)
  return (
    <div className="app">
      <div className="no-print">
        <header className="app-header">
          <div>
            <h1>Project Management Dashboard</h1>
            <p>Build professional project schedules for EV charging installations</p>
          </div>
          <div className="user-menu">
            <span className="user-email">{user.email}</span>
            {user.profile && <span className="user-role">{user.profile.role}</span>}
            <button className="btn-logout" onClick={signOut}>Sign Out</button>
          </div>
        </header>

        {showProjectList ? (
          <ProjectList
            onSelectProject={loadProject}
            onNewProject={handleNewProject}
            currentProjectId={currentProjectId || undefined}
          />
        ) : (
          <>
            <div className="nav-buttons">
              <button className="btn-back" onClick={() => setShowProjectList(true)}>
                ← Back to Projects
              </button>
              {currentProjectId && (
                <span className="editing-badge">Editing: {projectName}</span>
              )}
            </div>

            <div className="editor-container">
              <ProjectForm
                projectName={projectName}
                clientName={clientName}
                onProjectNameChange={setProjectName}
                onClientNameChange={setClientName}
                readOnly={!isAdmin}
              />

              <ColumnManager
                customFields={customFields}
                onFieldsChange={setCustomFields}
                readOnly={!isAdmin}
              />

              <TaskTable
                phases={phases}
                tasks={tasks}
                customFields={customFields}
                onPhasesChange={setPhases}
                onTasksChange={setTasks}
                readOnly={!isAdmin}
              />

              <div className="actions">
                <button className="btn-primary" onClick={handleGenerateChart}>
                  Generate Gantt Chart
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={handleSaveProject}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : currentProjectId ? 'Update Project' : 'Save Project'}
                    </button>
                    <button className="btn-secondary" onClick={handleExportJSON}>
                      Export JSON
                    </button>
                  </>
                )}
                {showChart && (
                  <button className="btn-secondary" onClick={handlePrint}>
                    Print / Save PDF
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showChart && (
        <div className="chart-section">
          <GanttChart
            projectName={projectName}
            clientName={clientName}
            phases={phases}
            tasks={tasks}
          />
        </div>
      )}
    </div>
  );
}

export default App;
