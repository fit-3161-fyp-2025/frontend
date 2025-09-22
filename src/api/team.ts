import type { CreateTeamPayload, GetUserTeamsRes, JoinTeamPayload, LeaveTeamPayload, TeamModel } from "@/types/team";
import { apiClient } from "./client";

export const teamApi = {
  join: async (data: JoinTeamPayload): Promise<void> => {
    await apiClient.post(`/teams/join-team/${data.team_id}`, data);
  },

  create: async (data: CreateTeamPayload): Promise<TeamModel> => {
    const response = await apiClient.post<TeamModel>(`/teams/create-team`, data);
    return response.data
  },

  leave: async (data: LeaveTeamPayload): Promise<void> => {
    await apiClient.post(`/teams/leave-team/${data.team_id}`);
  },

  getUserTeams: async (): Promise<TeamModel[]> => {
    const response = await apiClient.get<GetUserTeamsRes>(`/users/get-current-user-teams`);
    return response.data.teams;
  },

  promoteMember: async (teamId: string, memberId: string): Promise<void> => {
    await apiClient.post(`/teams/promote-team-member/${teamId}`, { member_id: memberId });
  },

  kickMember: async (teamId: string, memberId: string): Promise<void> => {
    await apiClient.post(`/teams/kick-team-member/${teamId}`, { member_id: memberId });
  }
};
