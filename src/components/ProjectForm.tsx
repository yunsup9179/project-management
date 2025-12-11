import React from 'react';

interface ProjectFormProps {
  projectName: string;
  clientName: string;
  onProjectNameChange: (name: string) => void;
  onClientNameChange: (name: string) => void;
  readOnly?: boolean;
}

export default function ProjectForm({
  projectName,
  clientName,
  onProjectNameChange,
  onClientNameChange,
  readOnly = false
}: ProjectFormProps) {
  return (
    <div className="project-form">
      <h2>Project Information</h2>
      <div className="form-group">
        <label htmlFor="projectName">Project Name</label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="e.g., Hyundai Glovis Irvine EV Charger Installation"
          disabled={readOnly}
        />
      </div>
      <div className="form-group">
        <label htmlFor="clientName">Client Name</label>
        <input
          id="clientName"
          type="text"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          placeholder="e.g., Hyundai Glovis"
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
