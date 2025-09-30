import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { type TeamModel, type UserTeamsState } from "@/types/team";
import { teamApi } from "@/api/team";
import { extractErrorMessage } from "@/utils/errorHandling";

const getSelectedTeamFromStorage = (): TeamModel | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("selectedTeam");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

const saveSelectedTeamToStorage = (team: TeamModel | null) => {
  if (typeof window === "undefined") return null;
  try {
    if (team) {
      localStorage.setItem("selectedTeam", JSON.stringify(team));
    } else {
      localStorage.removeItem("selectedTeam");
    }
  } catch {
    // ignore localstorage errors
  }
};

export const removeTeam = createAsyncThunk(
  "teams/removeTeam",
  async (team_id: string, { rejectWithValue }) => {
    try {
      await teamApi.leave({ team_id: team_id });
      return team_id;
    } catch (error) {
      const errMsg = extractErrorMessage(error);
      return rejectWithValue(errMsg);
    }
  }
);

const initialState: UserTeamsState = {
  teams: [],
  isFetchingTeams: false,
  selectedTeam: getSelectedTeamFromStorage(),
  selectedProjectId: null,
};

export const fetchTeams = createAsyncThunk("teams/fetchTeams", async () => {
  const teams = await teamApi.getUserTeams();
  return teams;
});

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    // Teams list operations
    setTeams(state, action: PayloadAction<TeamModel[]>) {
      state.teams = action.payload;
    },
    addTeam(state, action: PayloadAction<TeamModel>) {
      state.teams.push(action.payload);
    },
    // removeTeam(state, action: PayloadAction<string>) {
    //   state.teams = state.teams.filter(team => team.id !== action.payload);
    // },

    // Selected team operations
    setSelectedTeam(state, action: PayloadAction<TeamModel | null>) {
      state.selectedTeam = action.payload;
      saveSelectedTeamToStorage(action.payload);
    },
    setSelectedTeamById(state, action: PayloadAction<string>) {
      const team = state.teams.find((team) => team.id === action.payload);
      state.selectedTeam = team || null;
      saveSelectedTeamToStorage(team || null);
    },
    clearSelectedTeam(state) {
      state.selectedTeam = null;
    },

    // Store project id too
    setSelectedProjectId: (state, action) => {
      state.selectedProjectId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.isFetchingTeams = true;
      })

      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isFetchingTeams = false;
        state.teams = action.payload;

        // Always re-select the up-to-date team object from the fetched list
        let next: TeamModel | null = null;
        if (state.selectedTeam) {
          next =
            action.payload.find((t) => t.id === state.selectedTeam!.id) ?? null;
        }
        if (!next && action.payload.length > 0) {
          next = action.payload[0];
        }
        state.selectedTeam = next;
        saveSelectedTeamToStorage(next);
      })

      .addCase(fetchTeams.rejected, (state) => {
        state.isFetchingTeams = false;
      })

      .addCase(removeTeam.fulfilled, (state, action) => {
        const removedTeamId = action.payload;
        state.teams = state.teams.filter((team) => team.id !== removedTeamId);

        if (state.selectedTeam && state.selectedTeam.id === removedTeamId) {
          const newSelectedTeam =
            state.teams.length > 0 ? state.teams[0] : null;
          state.selectedTeam = newSelectedTeam;
          saveSelectedTeamToStorage(newSelectedTeam);
        }
      })

      .addCase(removeTeam.rejected, (_, action) => {
        console.error("Failed to remove team:", action.payload);
      });
  },
});

export const {
  setTeams,
  addTeam,
  setSelectedTeam,
  setSelectedTeamById,
  clearSelectedTeam,
  setSelectedProjectId,
} = teamsSlice.actions;

export default teamsSlice.reducer;
