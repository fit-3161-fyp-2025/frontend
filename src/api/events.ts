import type { GetAllEventsRes, CreateEventPayload, CreateEventRes, DeleteEventPayload } from "@/types/events"
import { apiClient } from "./client"

export const eventApi = {
  getAll: async (teamId: string): Promise<GetAllEventsRes> => {
    const response = await apiClient.post<GetAllEventsRes>(`/teams/get-team-events/${teamId}`);
    return response.data;
  },

  create: async (teamId: string, data: CreateEventPayload): Promise<CreateEventRes> => {
    const response = await apiClient.post<CreateEventRes>(`/teams/create-event/${teamId}`, data);
    return response.data;
  },

  delete: async (teamId: string, data: DeleteEventPayload): Promise<void> => {
    await apiClient.post(`/teams/delete-event/${teamId}`, data);
  },
}
