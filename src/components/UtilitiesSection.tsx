import { useState, useEffect } from 'react';
import { ProjectUtility, UtilityStatus } from '../types';
import { fetchProjectUtilities, createUtility, updateUtility, deleteUtility } from '../services/utilitiesService';

interface UtilitiesSectionProps {
  projectId: string | null;
  readOnly?: boolean;
}

const UTILITY_STATUSES: UtilityStatus[] = ['Pending', 'In Review', 'Approved', 'Denied'];

const STATUS_COLORS: Record<UtilityStatus, string> = {
  'Pending': '#6B7280',
  'In Review': '#2563EB',
  'Approved': '#10B981',
  'Denied': '#EF4444'
};

export default function UtilitiesSection({ projectId, readOnly = false }: UtilitiesSectionProps) {
  const [utilities, setUtilities] = useState<ProjectUtility[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUtility, setNewUtility] = useState({
    name: '',
    status: 'Pending' as UtilityStatus,
    submittedDate: '',
    notes: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadUtilities();
    } else {
      setUtilities([]);
    }
  }, [projectId]);

  const loadUtilities = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await fetchProjectUtilities(projectId);
      setUtilities(data);
    } catch (err) {
      console.error('Failed to load utilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUtility = async () => {
    if (!projectId || !newUtility.name.trim()) return;

    try {
      setIsAdding(true);
      const utility = await createUtility(
        projectId,
        newUtility.name.trim(),
        newUtility.status,
        newUtility.submittedDate || undefined,
        newUtility.notes || undefined
      );
      setUtilities([...utilities, utility]);
      setNewUtility({ name: '', status: 'Pending', submittedDate: '', notes: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to add utility');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStatusChange = async (utilityId: string, newStatus: UtilityStatus) => {
    try {
      const updated = await updateUtility(utilityId, { application_status: newStatus });
      setUtilities(utilities.map(u => u.id === utilityId ? updated : u));
    } catch (err) {
      alert('Failed to update utility status');
      console.error(err);
    }
  };

  const handleDateChange = async (utilityId: string, field: string, value: string) => {
    try {
      const updates: any = { [field]: value || null };
      const updated = await updateUtility(utilityId, updates);
      setUtilities(utilities.map(u => u.id === utilityId ? updated : u));
    } catch (err) {
      alert('Failed to update date');
      console.error(err);
    }
  };

  const handleDeleteUtility = async (utilityId: string) => {
    if (!confirm('Delete this utility record?')) return;

    try {
      await deleteUtility(utilityId);
      setUtilities(utilities.filter(u => u.id !== utilityId));
    } catch (err) {
      alert('Failed to delete utility');
      console.error(err);
    }
  };

  if (!projectId) {
    return (
      <div className="utilities-section">
        <h2>Utility Coordination</h2>
        <p className="utilities-empty">Save the project first to track utilities.</p>
      </div>
    );
  }

  return (
    <div className="utilities-section">
      <div className="section-header">
        <h2>Utility Coordination</h2>
        {!readOnly && !showAddForm && (
          <button className="btn-add-small" onClick={() => setShowAddForm(true)}>
            + Add Utility
          </button>
        )}
      </div>

      {loading ? (
        <div className="utilities-loading">Loading utilities...</div>
      ) : (
        <>
          {/* Add Form */}
          {showAddForm && !readOnly && (
            <div className="utility-add-form">
              <input
                className="input"
                type="text"
                placeholder="Utility Name (e.g., SCE, PG&E)"
                value={newUtility.name}
                onChange={(e) => setNewUtility({ ...newUtility, name: e.target.value })}
              />
              <select
                className="select"
                value={newUtility.status}
                onChange={(e) => setNewUtility({ ...newUtility, status: e.target.value as UtilityStatus })}
              >
                {UTILITY_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                placeholder="Application Submitted"
                value={newUtility.submittedDate}
                onChange={(e) => setNewUtility({ ...newUtility, submittedDate: e.target.value })}
              />
              <input
                className="input"
                type="text"
                placeholder="Notes (optional)"
                value={newUtility.notes}
                onChange={(e) => setNewUtility({ ...newUtility, notes: e.target.value })}
              />
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={handleAddUtility}
                  disabled={isAdding || !newUtility.name.trim()}
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

          {/* Utilities Table */}
          {utilities.length > 0 ? (
            <table className="utilities-table">
              <thead>
                <tr>
                  <th>Utility</th>
                  <th>Application Status</th>
                  <th>Submitted</th>
                  <th>Meter Set</th>
                  <th>Activation</th>
                  <th>Notes</th>
                  {!readOnly && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {utilities.map(utility => (
                  <tr key={utility.id}>
                    <td><strong>{utility.utility_name}</strong></td>
                    <td>
                      {readOnly ? (
                        <span
                          className="status-badge"
                          style={{ backgroundColor: STATUS_COLORS[utility.application_status] }}
                        >
                          {utility.application_status}
                        </span>
                      ) : (
                        <select
                          className="select status-select"
                          value={utility.application_status}
                          onChange={(e) => handleStatusChange(utility.id, e.target.value as UtilityStatus)}
                        >
                          {UTILITY_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>{utility.application_submitted_date || '-'}</td>
                    <td>
                      {readOnly ? (
                        utility.meter_set_date || '-'
                      ) : (
                        <input
                          className="input table-input"
                          type="date"
                          value={utility.meter_set_date || ''}
                          onChange={(e) => handleDateChange(utility.id, 'meter_set_date', e.target.value)}
                        />
                      )}
                    </td>
                    <td>
                      {readOnly ? (
                        utility.service_activation_date || '-'
                      ) : (
                        <input
                          className="input table-input"
                          type="date"
                          value={utility.service_activation_date || ''}
                          onChange={(e) => handleDateChange(utility.id, 'service_activation_date', e.target.value)}
                        />
                      )}
                    </td>
                    <td className="notes-cell">{utility.notes || '-'}</td>
                    {!readOnly && (
                      <td>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDeleteUtility(utility.id)}
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
            <p className="utilities-empty">No utility coordination tracked yet.</p>
          )}
        </>
      )}
    </div>
  );
}
