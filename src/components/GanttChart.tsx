import React from 'react';
import { Phase, Task } from '../types';
import { parseDate, getMonthsBetween, calculateBarPosition } from '../utils/dateHelpers';

interface GanttChartProps {
  projectName: string;
  clientName: string;
  phases: Phase[];
  tasks: Task[];
}

export default function GanttChart({ projectName, clientName, phases, tasks }: GanttChartProps) {
  if (tasks.length === 0) return null;

  const allDates = tasks.flatMap(t => [parseDate(t.startDate), parseDate(t.endDate)]);
  const projectStart = new Date(Math.min(...allDates.map(d => d.getTime())));
  const projectEnd = new Date(Math.max(...allDates.map(d => d.getTime())));

  const months = getMonthsBetween(projectStart, projectEnd);

  const tasksByPhase = phases.map(phase => ({
    phase,
    tasks: tasks.filter(t => t.phaseId === phase.id)
  }));

  return (
    <div className="gantt-container">
      <header className="gantt-header">
        <div>
          <h1>{projectName}</h1>
          <div className="subtitle">{clientName}</div>
        </div>
        <div className="logo">GANTT SCHEDULE</div>
      </header>

      <div className="chart-wrapper">
        <div className="sidebar">
          <div className="sidebar-header">Phase / Task</div>
          {tasksByPhase.map(({ phase, tasks }) => (
            <React.Fragment key={phase.id}>
              <div className="phase-header" style={{ borderLeft: `5px solid ${phase.color}`, backgroundColor: `${phase.color}15` }}>
                {phase.name.toUpperCase()}
              </div>
              {tasks.map(task => (
                <div key={task.id} className="task-row">
                  <div className="task-name">{task.name}</div>
                  <div className="task-date">{task.startDate} – {task.endDate}</div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <div className="timeline">
          <div className="timeline-header">
            {months.map((month, idx) => (
              <div key={idx} className="month-cell" style={{ flex: month.flex }}>
                {month.name}
              </div>
            ))}
          </div>

          <div className="bars-container">
            {tasksByPhase.map(({ phase, tasks }) => (
              <React.Fragment key={phase.id}>
                <div className="timeline-phase-spacer"></div>
                {tasks.map(task => {
                  const { left, width } = calculateBarPosition(task.startDate, task.endDate, projectStart, projectEnd);
                  const isMilestone = task.startDate === task.endDate;

                  return (
                    <div key={task.id} className="bar-row">
                      <div
                        className={`bar ${isMilestone ? 'milestone' : ''}`}
                        style={{
                          left: `${left}%`,
                          width: isMilestone ? '14px' : `${width}%`,
                          backgroundColor: phase.color,
                          borderColor: phase.color
                        }}
                      >
                        {!isMilestone && task.name}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="legend">
        {phases.map(phase => (
          <div key={phase.id} className="legend-item">
            <div className="legend-box" style={{ backgroundColor: phase.color }}></div>
            {phase.name}
          </div>
        ))}
      </div>
    </div>
  );
}
