import React, { useState } from 'react';
import { Phase, Task, CustomField } from '../types';

interface TaskTableProps {
  phases: Phase[];
  tasks: Task[];
  customFields: CustomField[];
  onPhasesChange: (phases: Phase[]) => void;
  onTasksChange: (tasks: Task[]) => void;
}

export default function TaskTable({ phases, tasks, customFields, onPhasesChange, onTasksChange }: TaskTableProps) {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    phaseId: phases[0]?.id || '',
    name: '',
    startDate: '',
    endDate: '',
    customFields: {}
  });

  const handleAddTask = () => {
    if (!newTask.name || !newTask.startDate || !newTask.endDate) {
      alert('Please fill task name, start date, and end date');
      return;
    }
    const task: Task = {
      id: Date.now().toString(),
      phaseId: newTask.phaseId || phases[0]?.id || '',
      name: newTask.name,
      startDate: newTask.startDate,
      endDate: newTask.endDate,
      customFields: newTask.customFields || {}
    };
    onTasksChange([...tasks, task]);
    setNewTask({ phaseId: phases[0]?.id || '', name: '', startDate: '', endDate: '', customFields: {} });
  };

  const handleRemoveTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="task-table">
      <h2>Tasks</h2>
      <table>
        <thead>
          <tr>
            <th>Phase</th>
            <th>Task Name</th>
            <th>Start</th>
            <th>End</th>
            {customFields.map(f => <th key={f.id}>{f.name}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const phase = phases.find(p => p.id === task.phaseId);
            return (
              <tr key={task.id}>
                <td style={{ backgroundColor: phase?.color, color: 'white', padding: '4px 8px' }}>{phase?.name}</td>
                <td>{task.name}</td>
                <td>{task.startDate}</td>
                <td>{task.endDate}</td>
                {customFields.map(f => <td key={f.id}>{task.customFields[f.name] || '-'}</td>)}
                <td><button onClick={() => handleRemoveTask(task.id)}>Delete</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="add-task-form">
        <select value={newTask.phaseId} onChange={(e) => setNewTask({ ...newTask, phaseId: e.target.value })}>
          {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="text" placeholder="Task name" value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} />
        <input type="date" value={newTask.startDate} onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })} />
        <input type="date" value={newTask.endDate} onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })} />
        {customFields.map(field => {
          if (field.type === 'select') {
            return (
              <select key={field.id} onChange={(e) => setNewTask({ ...newTask, customFields: { ...newTask.customFields, [field.name]: e.target.value } })}>
                <option value="">{field.name}</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            );
          }
          return (
            <input
              key={field.id}
              type={field.type}
              placeholder={field.name}
              onChange={(e) => setNewTask({ ...newTask, customFields: { ...newTask.customFields, [field.name]: e.target.value } })}
            />
          );
        })}
        <button onClick={handleAddTask}>Add Task</button>
      </div>
    </div>
  );
}
