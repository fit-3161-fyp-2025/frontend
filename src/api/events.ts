import type { GetAllEventsRes } from "@/types/events"
import { apiClient } from "./client"

export const eventApi = {
  getAll: async (teamId: string): Promise<GetAllEventsRes> => {
    const response = await apiClient.post<GetAllEventsRes>(`/teams/get-team-events/${teamId}`);
    return response.data;
  },

  // TODO: Delete event


  // TODO: Create event

}
