import React from 'react';
import { ProgressStatus } from '../types';

interface ProgressSectionProps {
  status: ProgressStatus;
  percent: number;
  onStatusChange: (status: ProgressStatus) => void;
  onPercentChange: (percent: number) => void;
  readOnly?: boolean;
}

const STATUS_OPTIONS: ProgressStatus[] = ['Pending', 'In Progress', 'Completed', 'On Hold'];

const STATUS_COLORS: Record<ProgressStatus, string> = {
  'Pending': '#6B7280',
  'In Progress': '#2563EB',
  'Completed': '#10B981',
  'On Hold': '#F59E0B'
};

export default function ProgressSection({
  status,
  percent,
  onStatusChange,
  onPercentChange,
  readOnly = false
}: ProgressSectionProps) {
  return (
    <div className="progress-section">
      <h2>Project Progress</h2>
      <div className="progress-content">
        <div className="progress-status-group">
          <label className="form-label">Status</label>
          {readOnly ? (
            <span
              className="status-badge"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            >
              {status}
            </span>
          ) : (
            <select
              className="select"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as ProgressStatus)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>

        <div className="progress-percent-group">
          <label className="form-label">
            Completion: <strong>{percent}%</strong>
          </label>
          {readOnly ? (
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${percent}%`,
                  backgroundColor: STATUS_COLORS[status]
                }}
              />
            </div>
          ) : (
            <>
              <input
                type="range"
                className="progress-slider"
                min="0"
                max="100"
                step="5"
                value={percent}
                onChange={(e) => onPercentChange(parseInt(e.target.value))}
              />
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: STATUS_COLORS[status]
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
