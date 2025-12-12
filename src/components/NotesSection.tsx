import { useState, useEffect } from 'react';
import { ProjectNote, NoteTag } from '../types';
import { fetchProjectNotes, createNote, deleteNote } from '../services/notesService';
import { useAuth } from '../contexts/AuthContext';

interface NotesSectionProps {
  projectId: string | null;
  canEdit?: boolean;
}

const NOTE_TAGS: { value: NoteTag; label: string; color: string }[] = [
  { value: 'general', label: 'General', color: '#6B7280' },
  { value: 'update', label: 'Update', color: '#2563EB' },
  { value: 'issue', label: 'Issue', color: '#EF4444' },
  { value: 'milestone', label: 'Milestone', color: '#10B981' }
];

export default function NotesSection({ projectId, canEdit = false }: NotesSectionProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState<NoteTag>('general');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadNotes();
    } else {
      setNotes([]);
    }
  }, [projectId]);

  const loadNotes = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await fetchProjectNotes(projectId);
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!projectId || !user || !newContent.trim()) return;

    try {
      setIsAdding(true);
      const note = await createNote(projectId, newContent.trim(), newTag, user.id);
      setNotes([note, ...notes]);
      setNewContent('');
      setNewTag('general');
    } catch (err) {
      alert('Failed to add note');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;

    try {
      await deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      alert('Failed to delete note');
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTagInfo = (tag: NoteTag) => {
    return NOTE_TAGS.find(t => t.value === tag) || NOTE_TAGS[0];
  };

  if (!projectId) {
    return (
      <div className="notes-section">
        <h2>Notes</h2>
        <p className="notes-empty">Save the project first to add notes.</p>
      </div>
    );
  }

  return (
    <div className="notes-section">
      <h2>Notes & Updates</h2>

      {canEdit && (
        <div className="note-form">
          <div className="note-form-header">
            <select
              className="select note-tag-select"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value as NoteTag)}
            >
              {NOTE_TAGS.map(tag => (
                <option key={tag.value} value={tag.value}>{tag.label}</option>
              ))}
            </select>
          </div>
          <textarea
            className="input note-textarea"
            placeholder="Add a note or update..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
          />
          <button
            className="btn-primary"
            onClick={handleAddNote}
            disabled={isAdding || !newContent.trim()}
          >
            {isAdding ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="notes-loading">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="notes-empty">No notes yet.</div>
      ) : (
        <div className="notes-list">
          {notes.map(note => {
            const tagInfo = getTagInfo(note.note_tag);
            return (
              <div key={note.id} className="note-item">
                <div className="note-header">
                  <span
                    className="note-tag-badge"
                    style={{ backgroundColor: tagInfo.color }}
                  >
                    {tagInfo.label}
                  </span>
                  <span className="note-author">{note.author_name}</span>
                  <span className="note-date">{formatDate(note.created_at)}</span>
                  {canEdit && (
                    <button
                      className="btn-delete-note"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="note-content">{note.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
