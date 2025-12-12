import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProjectUtility, UtilityStatus } from '../types';

// Fetch all utilities for a project
export async function fetchProjectUtilities(projectId: string): Promise<ProjectUtility[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabase
    .from('project_utilities')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching utilities:', error);
    throw error;
  }

  return (data || []).map(utility => ({
    id: utility.id,
    project_id: utility.project_id,
    utility_name: utility.utility_name,
    application_submitted_date: utility.application_submitted_date,
    application_status: utility.application_status as UtilityStatus,
    design_review_status: utility.design_review_status,
    meter_set_date: utility.meter_set_date,
    service_activation_date: utility.service_activation_date,
    notes: utility.notes,
    created_at: utility.created_at,
    updated_at: utility.updated_at
  }));
}

// Create a new utility
export async function createUtility(
  projectId: string,
  utilityName: string,
  applicationStatus: UtilityStatus,
  applicationSubmittedDate?: string,
  notes?: string
): Promise<ProjectUtility> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('project_utilities')
    .insert({
      project_id: projectId,
      utility_name: utilityName,
      application_status: applicationStatus,
      application_submitted_date: applicationSubmittedDate || null,
      notes: notes || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating utility:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    utility_name: data.utility_name,
    application_submitted_date: data.application_submitted_date,
    application_status: data.application_status as UtilityStatus,
    design_review_status: data.design_review_status,
    meter_set_date: data.meter_set_date,
    service_activation_date: data.service_activation_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

// Update a utility
export async function updateUtility(
  utilityId: string,
  updates: Partial<Omit<ProjectUtility, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<ProjectUtility> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('project_utilities')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', utilityId)
    .select()
    .single();

  if (error) {
    console.error('Error updating utility:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    utility_name: data.utility_name,
    application_submitted_date: data.application_submitted_date,
    application_status: data.application_status as UtilityStatus,
    design_review_status: data.design_review_status,
    meter_set_date: data.meter_set_date,
    service_activation_date: data.service_activation_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

// Delete a utility
export async function deleteUtility(utilityId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('project_utilities')
    .delete()
    .eq('id', utilityId);

  if (error) {
    console.error('Error deleting utility:', error);
    throw error;
  }

  return true;
}
