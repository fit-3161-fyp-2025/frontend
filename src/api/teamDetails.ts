import type { User } from "@/types/auth";
import { apiClient } from "./client";

export const teamDetailsApi = {
  getDetails: async (teamId: string): Promise<{ members: User[]; code: string }> => {
    const response = await apiClient.get(`/teams/get-team/${teamId}`);
    const data = response.data as { team?: { short_id?: string; member_ids?: string[] } };
    const code = data.team?.short_id ?? "";
    const memberIds = data.team?.member_ids ?? [];

    // Try to resolve user profiles if endpoint exists
    try {
      if (memberIds.length > 0) {
        const usersRes = await apiClient.post(`/users/get-users-by-ids`, { user_ids: memberIds });
        const users = usersRes.data as User[];
        return { code, members: users };
      }
    } catch {
      // Fall through to dev mock
    }

    // Dev-only mock members for testing UI with known short code
    if (import.meta.env.DEV && code === "hjrisp") {
      const mockEmails = [
        "alice@example.com",
        "bob@example.com",
        "carol@example.com",
        "dave@example.com",
      ];
      const members: User[] = memberIds.map((id, idx) => ({ id, email: mockEmails[idx % mockEmails.length] }));
      return { code, members };
    }

    return {
      code,
      members: [],
    };
  }
};
