export type FieldType = 'text' | 'date' | 'select' | 'number';

export interface CustomField {
  id: string;
  name: string;           // e.g., "Assignee", "Status", "Priority"
  type: FieldType;
  options?: string[];     // For select type: ["High", "Medium", "Low"]
  required?: boolean;
}

export interface Phase {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  phaseId: string;
  name: string;
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
  customFields: Record<string, any>; // Dynamic: { "Assignee": "John", "Status": "Done" }
}

export interface Project {
  id: string;
  name: string;
  client: string;
  createdAt: string;
  customFields: CustomField[];
  phases: Phase[];
  tasks: Task[];
  owner_id?: string;
}

export interface GanttConfig {
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

// User roles
export type UserRole = 'admin' | 'staff' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}
