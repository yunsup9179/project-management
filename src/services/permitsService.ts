import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProjectPermit, PermitType, PermitStatus } from '../types';

// Fetch all permits for a project
export async function fetchProjectPermits(projectId: string): Promise<ProjectPermit[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabase
    .from('project_permits')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching permits:', error);
    throw error;
  }

  return (data || []).map(permit => ({
    id: permit.id,
    project_id: permit.project_id,
    permit_type: permit.permit_type as PermitType,
    status: permit.status as PermitStatus,
    submitted_date: permit.submitted_date,
    approved_date: permit.approved_date,
    permit_number: permit.permit_number,
    notes: permit.notes,
    created_at: permit.created_at,
    updated_at: permit.updated_at
  }));
}

// Create a new permit
export async function createPermit(
  projectId: string,
  permitType: PermitType,
  status: PermitStatus,
  submittedDate?: string,
  notes?: string
): Promise<ProjectPermit> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('project_permits')
    .insert({
      project_id: projectId,
      permit_type: permitType,
      status,
      submitted_date: submittedDate || null,
      notes: notes || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating permit:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    permit_type: data.permit_type as PermitType,
    status: data.status as PermitStatus,
    submitted_date: data.submitted_date,
    approved_date: data.approved_date,
    permit_number: data.permit_number,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

// Update a permit
export async function updatePermit(
  permitId: string,
  updates: Partial<Omit<ProjectPermit, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<ProjectPermit> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('project_permits')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', permitId)
    .select()
    .single();

  if (error) {
    console.error('Error updating permit:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    permit_type: data.permit_type as PermitType,
    status: data.status as PermitStatus,
    submitted_date: data.submitted_date,
    approved_date: data.approved_date,
    permit_number: data.permit_number,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

// Delete a permit
export async function deletePermit(permitId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('project_permits')
    .delete()
    .eq('id', permitId);

  if (error) {
    console.error('Error deleting permit:', error);
    throw error;
  }

  return true;
}
