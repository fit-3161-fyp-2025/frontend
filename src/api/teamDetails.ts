import type { User } from "@/types/auth";
import { apiClient } from "./client";

export const teamDetailsApi = {
  getDetails: async (
    teamId: string
  ): Promise<{ members: User[]; code: string }> => {
    // Check for mock data first
    if (
      import.meta.env.DEV &&
      localStorage.getItem("showMockData") === "true"
    ) {
      const mockUsers: User[] = [
        {
          id: "507f1f77bcf86cd799439011",
          email: "john.smith@test.com",
          first_name: "John",
          last_name: "Smith",
        },
        {
          id: "507f1f77bcf86cd799439012",
          email: "sarah.johnson@test.com",
          first_name: "Sarah",
          last_name: "Johnson",
        },
        {
          id: "507f1f77bcf86cd799439013",
          email: "mike.brown@test.com",
          first_name: "Mike",
          last_name: "Brown",
        },
        {
          id: "507f1f77bcf86cd799439014",
          email: "emma.davis@test.com",
          first_name: "Emma",
          last_name: "Davis",
        },
        {
          id: "507f1f77bcf86cd799439015",
          email: "david.wilson@test.com",
          first_name: "David",
          last_name: "Wilson",
        },
        {
          id: "507f1f77bcf86cd799439016",
          email: "lisa.garcia@test.com",
          first_name: "Lisa",
          last_name: "Garcia",
        },
        {
          id: "507f1f77bcf86cd799439017",
          email: "tom.anderson@test.com",
          first_name: "Tom",
          last_name: "Anderson",
        },
        {
          id: "507f1fbccf86cd799439018",
          email: "jessica.thompson@test.com",
          first_name: "Jessica",
          last_name: "Thompson",
        },
        {
          id: "507f1fbccf86cd799439019",
          email: "robert.martinez@test.com",
          first_name: "Robert",
          last_name: "Martinez",
        },
        {
          id: "507f1fbccf86cd799439020",
          email: "amanda.clark@test.com",
          first_name: "Amanda",
          last_name: "Clark",
        },
        {
          id: "507f1fbccf86cd799439021",
          email: "daniel.morris@test.com",
          first_name: "Daniel",
          last_name: "Morris",
        },
        {
          id: "507f1fbccf86cd799439022",
          email: "michelle.lee@test.com",
          first_name: "Michelle",
          last_name: "Lee",
        },
      ];
      return { code: "hjrisp", members: mockUsers };
    }

    const response = await apiClient.get(`/teams/get-team/${teamId}`);
    const data = response.data as {
      team?: { short_id?: string; member_ids?: string[] };
    };
    const code = data.team?.short_id ?? "";
    const memberIds = data.team?.member_ids ?? [];

    // Try to resolve user profiles if endpoint exists
    try {
      if (memberIds.length > 0) {
        const usersRes = await apiClient.post(`/users/get-users-by-ids`, {
          user_ids: memberIds,
        });
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
      const members: User[] = memberIds.map((id, idx) => ({
        id,
        email: mockEmails[idx % mockEmails.length],
      }));
      return { code, members };
    }
    return {
      code,
      members: [],
    };
  },
};
