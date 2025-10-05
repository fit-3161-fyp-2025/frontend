import type { GetAllEventsRes } from "@/types/events"
import { publicApiClient } from "./publicClient"

export interface SendRSVPRequest {
  email: string;
}

export interface SendRSVPResponse {
  rsvp_id: string;
}

export const publicEventApi = {
  getAll: async (): Promise<GetAllEventsRes> => {
    const response = await publicApiClient.get<GetAllEventsRes>("/events/public/all");
    return response.data;
  },

  sendRSVP: async (eventId: string, email: string): Promise<SendRSVPResponse> => {
    const response = await publicApiClient.post<SendRSVPResponse>(
      `/events/send-rsvp-email/${eventId}`, 
      { email }
    );
    return response.data;
  },
};
