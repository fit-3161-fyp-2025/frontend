import type { User } from "@/types/auth";
import { apiClient } from "./client";

export const teamDetailsApi = {
  getDetails: async (teamId: string): Promise<{ members: User[]; code: string }> => {
    // Replace with actual endpoint
    const response = await apiClient.get(`/teams/${teamId}/details`);
  return response.data as { members: User[]; code: string };
  }
};
