import React, { useState } from 'react';
import { CustomField, FieldType } from '../types';

interface ColumnManagerProps {
  customFields: CustomField[];
  onFieldsChange: (fields: CustomField[]) => void;
  readOnly?: boolean;
}

export default function ColumnManager({ customFields, onFieldsChange, readOnly = false }: ColumnManagerProps) {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [fieldOptions, setFieldOptions] = useState('');

  const handleAddField = () => {
    if (!fieldName.trim()) return;

    const newField: CustomField = {
      id: Date.now().toString(),
      name: fieldName,
      type: fieldType,
      options: fieldType === 'select' ? fieldOptions.split(',').map(o => o.trim()).filter(Boolean) : undefined,
      required: false
    };

    onFieldsChange([...customFields, newField]);
    setFieldName('');
    setFieldOptions('');
  };

  const handleRemoveField = (id: string) => {
    onFieldsChange(customFields.filter(f => f.id !== id));
  };

  return (
    <div className="column-manager">
      <h2>Custom Columns</h2>
      <p className="help-text">Define additional fields for your tasks (e.g., Assignee, Status, Priority)</p>

      <div className="custom-fields-list">
        {customFields.map(field => (
          <div key={field.id} className="field-item">
            <span className="field-name">{field.name}</span>
            <span className="field-type">({field.type})</span>
            {field.options && <span className="field-options">Options: {field.options.join(', ')}</span>}
            {!readOnly && <button className="btn-remove" onClick={() => handleRemoveField(field.id)}>Remove</button>}
          </div>
        ))}
      </div>

      {!readOnly && (
      <div className="add-field-form">
        <input
          type="text"
          placeholder="Column name (e.g., Assignee)"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
        />
        <select value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)}>
          <option value="text">Text</option>
          <option value="select">Dropdown</option>
          <option value="date">Date</option>
          <option value="number">Number</option>
        </select>
        {fieldType === 'select' && (
          <input
            type="text"
            placeholder="Options (comma-separated)"
            value={fieldOptions}
            onChange={(e) => setFieldOptions(e.target.value)}
          />
        )}
        <button className="btn-add" onClick={handleAddField}>Add Column</button>
      </div>
      )}
    </div>
  );
}
