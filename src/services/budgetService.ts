import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BudgetItem, BudgetItemType } from '../types';

// Fetch all budget items for a project
export async function fetchBudgetItems(projectId: string): Promise<BudgetItem[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching budget items:', error);
    throw error;
  }

  return (data || []).map(item => ({
    id: item.id,
    project_id: item.project_id,
    description: item.description,
    amount: parseFloat(item.amount) || 0,
    item_type: item.item_type as BudgetItemType,
    created_at: item.created_at,
    created_by: item.created_by
  }));
}

// Create a new budget item
export async function createBudgetItem(
  projectId: string,
  description: string,
  amount: number,
  itemType: BudgetItemType,
  userId: string
): Promise<BudgetItem> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      project_id: projectId,
      description,
      amount,
      item_type: itemType,
      created_by: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating budget item:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    description: data.description,
    amount: parseFloat(data.amount) || 0,
    item_type: data.item_type as BudgetItemType,
    created_at: data.created_at,
    created_by: data.created_by
  };
}

// Update a budget item
export async function updateBudgetItem(
  itemId: string,
  description: string,
  amount: number,
  itemType: BudgetItemType
): Promise<BudgetItem> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('budget_items')
    .update({
      description,
      amount,
      item_type: itemType
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget item:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    description: data.description,
    amount: parseFloat(data.amount) || 0,
    item_type: data.item_type as BudgetItemType,
    created_at: data.created_at,
    created_by: data.created_by
  };
}

// Delete a budget item
export async function deleteBudgetItem(itemId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting budget item:', error);
    throw error;
  }

  return true;
}
