import { apiClient } from "./client";
import type { Project, ToDoItem, UserTeamsResponse } from "@/types/projects";

export interface TeamResponse {
  team: {
    id: string;
    name: string;
    member_ids: string[];
    exec_member_ids: string[];
    project_ids: string[];
    event_ids: string[];
  };
}

export interface ProjectResponse {
  project: Project;
}

export interface TodoItemsResponse {
  todos: ToDoItem[];
}

export const projectsApi = {
  // Get team details
  async getTeam(teamId: string): Promise<TeamResponse> {
    const response = await apiClient.get<TeamResponse>(
      `/teams/get-team/${teamId}`
    );
    return response.data;
  },
  // Get current user teams
  async getCurrentUserTeams(): Promise<UserTeamsResponse> {
    const response = await apiClient.get<UserTeamsResponse>(
      `/users/get-current-user-teams`
    );
    console.log("Raw teams API response:", response);
    console.log("Teams API response data:", response.data);
    return response.data;
  },

  // Get project details
  async getProject(projectId: string): Promise<ProjectResponse> {
    console.log(`Making API call to /projects/get-project/${projectId}`);
    try {
      const response = await apiClient.get<ProjectResponse>(
        `/projects/get-project/${projectId}`
      );
      console.log(`Project ${projectId} API response:`, response);
      console.log(`Project ${projectId} response data:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  },

  // Get all todo items for a project
  async getTodoItems(projectId: string): Promise<TodoItemsResponse> {
    const response = await apiClient.get<TodoItemsResponse>(
      `/projects/get-todo-items/${projectId}`
    );
    return response.data;
  },

  // Add a new todo item
  async addTodo(projectId: string, todoData: Partial<ToDoItem>) {
    const response = await apiClient.post(
      `/projects/add-todo/${projectId}`,
      todoData
    );
    return response.data;
  },

  // Update a todo item
  async updateTodo(projectId: string, todoData: Partial<ToDoItem>) {
    const response = await apiClient.post(
      `/projects/update-todo/${projectId}`,
      todoData
    );
    return response.data;
  },

  // Delete a todo item
  async deleteTodo(projectId: string, todoId: string) {
    const response = await apiClient.delete(
      `/projects/delete-todo/${projectId}`,
      {
        data: { todo_id: todoId },
      }
    );
    return response.data;
  },

  // Reorder todo items
  async reorderTodoItems(projectId: string, orderedIds: string[]) {
    const response = await apiClient.post(
      `/projects/reorder-todo-items/${projectId}`,
      {
        ordered_ids: orderedIds,
      }
    );
    return response.data;
  },

  // Add a new todo status
  async addTodoStatus(
    projectId: string,
    statusData: { name: string; color?: string }
  ) {
    const response = await apiClient.post(
      `/projects/add-todo-status/${projectId}`,
      statusData
    );
    return response.data;
  },

  // Delete a todo status
  async deleteTodoStatus(projectId: string, statusId: string) {
    const response = await apiClient.delete(
      `/projects/delete-todo-status/${projectId}`,
      {
        data: { status_id: statusId },
      }
    );
    return response.data;
  },

  // Reorder todo statuses
  async reorderTodoStatuses(projectId: string, orderedIds: string[]) {
    const response = await apiClient.post(
      `/projects/reorder-todo-statuses/${projectId}`,
      {
        ordered_ids: orderedIds,
      }
    );
    return response.data;
  },
};
