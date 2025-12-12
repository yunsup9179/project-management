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

// ============================================
// Progress Types
// ============================================
export type ProgressStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold';

// ============================================
// Budget Types
// ============================================
export type BudgetItemType = 'original' | 'change_order';

export interface BudgetItem {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  item_type: BudgetItemType;
  created_at: string;
  created_by?: string;
}

// ============================================
// Notes Types
// ============================================
export type NoteTag = 'update' | 'issue' | 'milestone' | 'general';

export interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  note_tag: NoteTag;
  created_at: string;
  updated_at: string;
  author_id?: string;
  author_name?: string; // Joined from profiles
}

// ============================================
// Permit Types
// ============================================
export type PermitType = 'Electrical' | 'Building' | 'Planning' | 'Fire' | 'Other';
export type PermitStatus = 'Pending' | 'In Review' | 'Approved' | 'Corrections Required';

export interface ProjectPermit {
  id: string;
  project_id: string;
  permit_type: PermitType;
  status: PermitStatus;
  submitted_date?: string;
  approved_date?: string;
  permit_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Utility Types
// ============================================
export type UtilityStatus = 'Pending' | 'In Review' | 'Approved' | 'Denied';

export interface ProjectUtility {
  id: string;
  project_id: string;
  utility_name: string;
  application_submitted_date?: string;
  application_status: UtilityStatus;
  design_review_status?: string;
  meter_set_date?: string;
  service_activation_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Project (Updated with new fields)
// ============================================
export interface Project {
  id: string;
  name: string;
  client: string;
  createdAt: string;
  customFields: CustomField[];
  phases: Phase[];
  tasks: Task[];
  owner_id?: string;
  // Progress fields
  progress_status?: ProgressStatus;
  progress_percent?: number;
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
