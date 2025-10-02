export interface TodoStatus {
  id: string;
  name: string;
  color: string;
}

export interface addTodoStatus {
  name: string;
  color: string;
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
  assignee_id: string;
  approved: boolean;
}

export type Column = {
  id: string;
  name: string;
  color: string;
};

export type UserDetails = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type Feature = {
  id: string;
  name: string;
  description: string;
  startAt: Date;
  endAt: Date;
  column: string;
  owner: UserDetails;
};
