import type {
  CreateTeamPayload,
  GetUserTeamsRes,
  JoinTeamPayload,
  LeaveTeamPayload,
  TeamModel,
  CreateEventRequest,
  CreateEventResponse,
  GetTeamEventsResponse,
} from "@/types/team";
import { apiClient } from "./client";

export interface GetTeamResponse {
  team: TeamModel;
}

export const teamApi = {
  join: async (data: JoinTeamPayload): Promise<void> => {
    await apiClient.post(`/teams/join-team/${data.team_id}`, data);
  },

  joinByShortId: async (shortId: string): Promise<void> => {
    await apiClient.post(`/teams/join-team-by-short-id/${shortId}`);
  },

  create: async (data: CreateTeamPayload): Promise<TeamModel> => {
    const response = await apiClient.post<TeamModel>(
      `/teams/create-team`,
      data
    );
    return response.data;
  },

  leave: async (data: LeaveTeamPayload): Promise<void> => {
    await apiClient.post(`/teams/leave-team/${data.team_id}`);
  },

  getUserTeams: async (): Promise<TeamModel[]> => {
    const response = await apiClient.get<GetUserTeamsRes>(
      `/users/get-current-user-teams`
    );
    return response.data.teams;
  },

  promoteMember: async (teamId: string, memberId: string): Promise<void> => {
    await apiClient.post(`/teams/promote-team-member/${teamId}`, {
      member_id: memberId,
    });
  },

  kickMember: async (teamId: string, memberId: string): Promise<void> => {
    await apiClient.post(`/teams/kick-team-member/${teamId}`, {
      member_id: memberId,
    });
  },

  getTeam: async (teamId: string): Promise<GetTeamResponse> => {
    // Check for mock data toggle
    if (
      import.meta.env.DEV &&
      localStorage.getItem("showMockData") === "true"
    ) {
      // Return mock team data with executive IDs
      return {
        team: {
          id: teamId || "507f1f77bcf86cd799439000",
          // short_id: "hjrisp", // Commented out until backend has this field
          name: "Development Team Alpha",
          member_ids: [
            "507f1f77bcf86cd799439011",
            "507f1f77bcf86cd799439012",
            "507f1f77bcf86cd799439013",
            "507f1f77bcf86cd799439014",
            "507f1f77bcf86cd799439015",
            "507f1f77bcf86cd799439016",
            "507f1f77bcf86cd799439017",
            "507f1fbccf86cd799439018",
            "507f1fbccf86cd799439019",
            "507f1fbccf86cd799439020",
            "507f1fbccf86cd799439021",
            "507f1fbccf86cd799439022",
          ],
          exec_member_ids: [
            "507f1f77bcf86cd799439011",
            "507f1f77bcf86cd799439012",
          ],
          project_ids: [],
          kanban_ids: [],
          event_ids: [],
        },
      };
    }

    const response = await apiClient.get<GetTeamResponse>(
      `/teams/get-team/${teamId}`
    );
    return response.data;
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    await apiClient.post(`/teams/delete-team/${teamId}`);
  },

  deleteProject: async (teamId: string, projectId: string): Promise<void> => {
    await apiClient.delete(`/teams/delete-project/${teamId}`, {
      data: { project_id: projectId },
    });
  },

  createEvent: async (
    teamId: string,
    eventData: CreateEventRequest
  ): Promise<CreateEventResponse> => {
    const response = await apiClient.post(
      `/teams/create-event/${teamId}`,
      eventData
    );
    return response.data as CreateEventResponse;
  },

  deleteEvent: async (teamId: string, eventId: string): Promise<void> => {
    await apiClient.post(`/teams/delete-event/${teamId}`, {
      event_id: eventId,
    });
  },

  getTeamEvents: async (teamId: string): Promise<GetTeamEventsResponse> => {
    const response = await apiClient.post(`/teams/get-team-events/${teamId}`);
    return response.data as GetTeamEventsResponse;
  },
};
