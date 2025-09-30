export interface JoinTeamPayload {
  team_id: string;
}

export interface CreateTeamPayload {
  name: string;
}

export interface CreateTeamRes {
  team: TeamModel;
}

export interface LeaveTeamPayload {
  team_id: string;
}

export interface TeamModel {
  id: string;
  name: string;
  short_id?: string;
  member_ids: string[];
  exec_member_ids: string[];
  kanban_ids: string[];
  project_ids: string[];
  event_ids: string[];
}

export interface EventModel {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  colour: string;
  location: string;
  rsvp_ids: string[];
  public: boolean;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  start: string;
  end: string;
  colour: string;
  location: string;
}

export interface CreateEventResponse {
  event: EventModel;
}

export interface GetTeamEventsResponse {
  events: EventModel[];
}

export interface GetUserTeamsRes {
  teams: TeamModel[];
}

export interface UserTeamsState {
  teams: TeamModel[];
  isFetchingTeams: boolean;
  selectedTeam: TeamModel | null;
  selectedProjectId: string | null;
}
