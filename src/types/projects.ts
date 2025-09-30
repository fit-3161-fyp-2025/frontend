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

export interface UserDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface TodoItemsResponse {
  todos: ToDoItem[];
}

export interface ProposedTodosResponse {
  proposed_todos: ToDoItem[];
}

export interface Column {
  id: string;
  name: string;
  color: string;
  [key: string]: unknown;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  startAt: string | Date;
  endAt: string | Date;
  column: string;
  owner: UserDetails;
  [key: string]: unknown;
}
