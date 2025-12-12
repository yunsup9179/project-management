import { useState, useEffect } from 'react';
import { ProjectPermit, PermitType, PermitStatus } from '../types';
import { fetchProjectPermits, createPermit, updatePermit, deletePermit } from '../services/permitsService';

interface PermitsSectionProps {
  projectId: string | null;
  readOnly?: boolean;
}

const PERMIT_TYPES: PermitType[] = ['Electrical', 'Building', 'Planning', 'Fire', 'Other'];
const PERMIT_STATUSES: PermitStatus[] = ['Pending', 'In Review', 'Approved', 'Corrections Required'];

const STATUS_COLORS: Record<PermitStatus, string> = {
  'Pending': '#6B7280',
  'In Review': '#2563EB',
  'Approved': '#10B981',
  'Corrections Required': '#F59E0B'
};

export default function PermitsSection({ projectId, readOnly = false }: PermitsSectionProps) {
  const [permits, setPermits] = useState<ProjectPermit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPermit, setNewPermit] = useState({
    type: 'Electrical' as PermitType,
    status: 'Pending' as PermitStatus,
    submittedDate: '',
    notes: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadPermits();
    } else {
      setPermits([]);
    }
  }, [projectId]);

  const loadPermits = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await fetchProjectPermits(projectId);
      setPermits(data);
    } catch (err) {
      console.error('Failed to load permits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermit = async () => {
    if (!projectId) return;

    try {
      setIsAdding(true);
      const permit = await createPermit(
        projectId,
        newPermit.type,
        newPermit.status,
        newPermit.submittedDate || undefined,
        newPermit.notes || undefined
      );
      setPermits([...permits, permit]);
      setNewPermit({ type: 'Electrical', status: 'Pending', submittedDate: '', notes: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to add permit');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStatusChange = async (permitId: string, newStatus: PermitStatus) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'Approved') {
        updates.approved_date = new Date().toISOString().split('T')[0];
      }
      const updated = await updatePermit(permitId, updates);
      setPermits(permits.map(p => p.id === permitId ? updated : p));
    } catch (err) {
      alert('Failed to update permit status');
      console.error(err);
    }
  };

  const handleDeletePermit = async (permitId: string) => {
    if (!confirm('Delete this permit?')) return;

    try {
      await deletePermit(permitId);
      setPermits(permits.filter(p => p.id !== permitId));
    } catch (err) {
      alert('Failed to delete permit');
      console.error(err);
    }
  };

  if (!projectId) {
    return (
      <div className="permits-section">
        <h2>Permits</h2>
        <p className="permits-empty">Save the project first to track permits.</p>
      </div>
    );
  }

  return (
    <div className="permits-section">
      <div className="section-header">
        <h2>Permits</h2>
        {!readOnly && !showAddForm && (
          <button className="btn-add-small" onClick={() => setShowAddForm(true)}>
            + Add Permit
          </button>
        )}
      </div>

      {loading ? (
        <div className="permits-loading">Loading permits...</div>
      ) : (
        <>
          {/* Add Form */}
          {showAddForm && !readOnly && (
            <div className="permit-add-form">
              <select
                className="select"
                value={newPermit.type}
                onChange={(e) => setNewPermit({ ...newPermit, type: e.target.value as PermitType })}
              >
                {PERMIT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                className="select"
                value={newPermit.status}
                onChange={(e) => setNewPermit({ ...newPermit, status: e.target.value as PermitStatus })}
              >
                {PERMIT_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                placeholder="Submitted Date"
                value={newPermit.submittedDate}
                onChange={(e) => setNewPermit({ ...newPermit, submittedDate: e.target.value })}
              />
              <input
                className="input"
                type="text"
                placeholder="Notes (optional)"
                value={newPermit.notes}
                onChange={(e) => setNewPermit({ ...newPermit, notes: e.target.value })}
              />
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={handleAddPermit}
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Permits Table */}
          {permits.length > 0 ? (
            <table className="permits-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Approved</th>
                  <th>Permit #</th>
                  <th>Notes</th>
                  {!readOnly && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {permits.map(permit => (
                  <tr key={permit.id}>
                    <td><strong>{permit.permit_type}</strong></td>
                    <td>
                      {readOnly ? (
                        <span
                          className="status-badge"
                          style={{ backgroundColor: STATUS_COLORS[permit.status] }}
                        >
                          {permit.status}
                        </span>
                      ) : (
                        <select
                          className="select status-select"
                          value={permit.status}
                          onChange={(e) => handleStatusChange(permit.id, e.target.value as PermitStatus)}
                        >
                          {PERMIT_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>{permit.submitted_date || '-'}</td>
                    <td>{permit.approved_date || '-'}</td>
                    <td>{permit.permit_number || '-'}</td>
                    <td className="notes-cell">{permit.notes || '-'}</td>
                    {!readOnly && (
                      <td>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDeletePermit(permit.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="permits-empty">No permits tracked yet.</p>
          )}
        </>
      )}
    </div>
  );
}
