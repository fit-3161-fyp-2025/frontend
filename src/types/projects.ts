export interface TodoStatus {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  todo_statuses: TodoStatus[];
  todo_ids: string[];
  budget_available: number;
  budget_spent: number;
}

export interface ToDoItem {
  id: string;
  name: string;
  description: string;
  status_id: string;
  owner_id: string;
}

export interface Team {
  id: string;
  name: string;
  member_ids: string[];
  exec_member_ids: string[];
  project_ids: string[];
  event_ids: string[];
}

export interface UserTeamsResponse {
  teams: Team[];
}

// Kanban view types
export type Column = {
  id: string;
  name: string;
  color: string;
};

export type User = {
  id: string;
  name: string;
  image: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  column: string;
  owner: User;
};
