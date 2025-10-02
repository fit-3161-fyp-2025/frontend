import { apiClient } from "./client";
import type {
  addTodoStatus,
  Project,
  ToDoItem,
  TodoStatus,
} from "@/types/projects";
import type { TeamModel } from "@/types/team";

export interface ProjectResponse {
  project: Project;
}

export interface TodoItemsResponse {
  todos: ToDoItem[];
}

export const projectsApi = {
  async getProject(projectId: string): Promise<ProjectResponse> {
    try {
      const response = await apiClient.get<ProjectResponse>(
        `/projects/get-project/${projectId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  },

  async getTodoItems(projectId: string): Promise<TodoItemsResponse> {
    const response = await apiClient.get<TodoItemsResponse>(
      `/projects/get-todo-items/${projectId}`
    );
    return response.data;
  },

  async addTodo(projectId: string, todoData: Partial<ToDoItem>) {
    const response = await apiClient.post(
      `/projects/add-todo/${projectId}`,
      todoData
    );
    return response.data;
  },

  async updateTodo(
    projectId: string,
    todoData: {
      id: string;
      name: string;
      description: string;
      status_id: string;
      assignee_id: string;
    }
  ) {
    const requestData = {
      todo_id: todoData.id,
      name: todoData.name,
      description: todoData.description,
      status_id: todoData.status_id,
      assignee_id: todoData.assignee_id,
    };

    const response = await apiClient.post(
      `/projects/update-todo/${projectId}`,
      requestData
    );
    return response.data;
  },

  async deleteTodo(projectId: string, todoId: string) {
    const response = await apiClient.delete(
      `/projects/delete-todo/${projectId}`,
      {
        data: { todo_id: todoId },
      }
    );
    return response.data;
  },

  async addTodoStatus(project_id: string, todoStatus: addTodoStatus) {
    const response = await apiClient.post(
      `/projects/add-todo-status/${project_id}`,
      todoStatus
    );
    return response.data;
  },

  async deleteTodoStatus(projectId: string, statusId: string) {
    const response = await apiClient.post(
      `/projects/delete-todo-status/${projectId}`,
      { status_id: statusId }
    );

    try {
      return response.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async reorderTodoStatus(projectId: string, todoStatuses: TodoStatus[]) {
    const response = await apiClient.post(
      `/projects/reorder-todo-items/${projectId}`,
      todoStatuses
    );
    return response.data;
  },

  async updateTodoStatus(projectId: string, todoStatus: TodoStatus) {
    const payload = {
      status_id: todoStatus.id,
      name: todoStatus.name,
      color: todoStatus.color,
    };

    const response = await apiClient.post(
      `/projects/update-todo-status/${projectId}`,
      payload
    );

    return response.data;
  },

  async createProject(
    teamId: string,
    name: string,
    description?: string
  ): Promise<ProjectResponse> {
    const response = await apiClient.post<ProjectResponse>(
      `/teams/create-project/${teamId}`,
      {
        name,
        description,
      }
    );
    return response.data;
  },

  async getTeam(teamId: string): Promise<{ team: TeamModel }> {
    try {
      const response = await apiClient.get(`/teams/get-team/${teamId}`);
      return response.data as { team: TeamModel };
    } catch (error) {
      console.error(`Error fetching team ${teamId}:`, error);
      throw error;
    }
  },

  async deleteProject(teamId: string, projectId: string): Promise<void> {
    // Endpoint documented as DELETE /teams/delete-project/{team_id} with body { project_id }
    await apiClient.delete(`/teams/delete-project/${teamId}`, {
      data: { project_id: projectId },
    });
  },

  // Budget: increase available budget
  async increaseBudget(projectId: string, amount: number): Promise<void> {
    await apiClient.post(`/projects/increase-budget/${projectId}`, undefined, {
      params: { amount },
    });
  },

  // Budget: spend budget
  async spendBudget(projectId: string, amount: number): Promise<void> {
    await apiClient.post(`/projects/spend-budget/${projectId}`, undefined, {
      params: { amount },
    });
  },
};
