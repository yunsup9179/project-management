import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProjectNote, NoteTag } from '../types';

// Fetch all notes for a project
export async function fetchProjectNotes(projectId: string): Promise<ProjectNote[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabase
    .from('project_notes')
    .select(`
      id,
      project_id,
      content,
      note_tag,
      created_at,
      updated_at,
      author_id,
      profiles:author_id (full_name, email)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return (data || []).map(note => ({
    id: note.id,
    project_id: note.project_id,
    content: note.content,
    note_tag: note.note_tag || 'general',
    created_at: note.created_at,
    updated_at: note.updated_at,
    author_id: note.author_id,
    author_name: note.profiles?.full_name || note.profiles?.email || 'Unknown'
  }));
}

// Create a new note
export async function createNote(
  projectId: string,
  content: string,
  noteTag: NoteTag,
  authorId: string
): Promise<ProjectNote> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('project_notes')
    .insert({
      project_id: projectId,
      content,
      note_tag: noteTag,
      author_id: authorId
    })
    .select(`
      id,
      project_id,
      content,
      note_tag,
      created_at,
      updated_at,
      author_id,
      profiles:author_id (full_name, email)
    `)
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    content: data.content,
    note_tag: data.note_tag || 'general',
    created_at: data.created_at,
    updated_at: data.updated_at,
    author_id: data.author_id,
    author_name: data.profiles?.full_name || data.profiles?.email || 'Unknown'
  };
}

// Update a note
export async function updateNote(
  noteId: string,
  content: string,
  noteTag: NoteTag
): Promise<ProjectNote> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('project_notes')
    .update({
      content,
      note_tag: noteTag,
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId)
    .select(`
      id,
      project_id,
      content,
      note_tag,
      created_at,
      updated_at,
      author_id,
      profiles:author_id (full_name, email)
    `)
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }

  return {
    id: data.id,
    project_id: data.project_id,
    content: data.content,
    note_tag: data.note_tag || 'general',
    created_at: data.created_at,
    updated_at: data.updated_at,
    author_id: data.author_id,
    author_name: data.profiles?.full_name || data.profiles?.email || 'Unknown'
  };
}

// Delete a note
export async function deleteNote(noteId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('project_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }

  return true;
}
