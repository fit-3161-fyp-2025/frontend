import type { GetAllEventsRes, CreateEventPayload, CreateEventRes, DeleteEventPayload, GetRSVPResponse, InviteRSVPResponse } from "@/types/events"
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

  update: async (eventId: string, data: CreateEventPayload): Promise<void> => {
    await apiClient.post(`/events/update-event-details/${eventId}`, data);
  },

  getRSVPs: async (eventId: string): Promise<GetRSVPResponse> => {
    const response = await apiClient.get<GetRSVPResponse>(`/events/get-event-rsvps/${eventId}`);
    return response.data;
  },

  inviteGuest: async (eventId: string, email: string): Promise<InviteRSVPResponse> => {
    const response = await apiClient.post<InviteRSVPResponse>(`/events/send-rsvp-email/${eventId}`, { email: email });
    return response.data;
  },
}
