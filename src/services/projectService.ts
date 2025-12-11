import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project } from '../types';

export interface ProjectSummary {
  id: string;
  name: string;
  client: string;
  created_at: string;
  updated_at: string;
  taskCount: number;
}

// Fetch all projects (summary view)
export async function fetchAllProjects(): Promise<ProjectSummary[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, client, created_at, updated_at, tasks')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    client: p.client,
    created_at: p.created_at,
    updated_at: p.updated_at,
    taskCount: Array.isArray(p.tasks) ? p.tasks.length : 0
  }));
}

// Fetch single project (full data)
export async function fetchProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    throw error; // Changed: throw instead of return null for consistency
  }

  return {
    id: data.id,
    name: data.name,
    client: data.client,
    createdAt: data.created_at,
    customFields: data.custom_fields || [],
    phases: data.phases || [],
    tasks: data.tasks || []
  };
}

// Create new project
export async function createProject(project: Omit<Project, 'id' | 'createdAt'>, userId: string): Promise<Project | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return null;
  }

  console.log('Creating project with userId:', userId);
  console.log('Project data:', {
    name: project.name,
    client: project.client,
    customFields: project.customFields,
    phases: project.phases,
    tasks: project.tasks
  });

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: project.name,
      client: project.client,
      owner_id: userId,
      custom_fields: project.customFields,
      phases: project.phases,
      tasks: project.tasks
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }

  console.log('Project created successfully:', data);

  return {
    id: data.id,
    name: data.name,
    client: data.client,
    createdAt: data.created_at,
    customFields: data.custom_fields || [],
    phases: data.phases || [],
    tasks: data.tasks || [],
    owner_id: data.owner_id
  };
}

// Update existing project
export async function updateProject(id: string, project: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return null;
  }

  const updateData: any = {};
  if (project.name !== undefined) updateData.name = project.name;
  if (project.client !== undefined) updateData.client = project.client;
  if (project.customFields !== undefined) updateData.custom_fields = project.customFields;
  if (project.phases !== undefined) updateData.phases = project.phases;
  if (project.tasks !== undefined) updateData.tasks = project.tasks;

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    client: data.client,
    createdAt: data.created_at,
    customFields: data.custom_fields || [],
    phases: data.phases || [],
    tasks: data.tasks || []
  };
}

// Delete project
export async function deleteProject(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return false;
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }

  return true;
}
