import { useSelector } from "react-redux";
import { useAppDispatch } from "./hooks/redux";
import type { RootState } from "./lib/store";
import { useEffect, useState } from "react";
import { fetchTeams, removeTeam } from "./features/teams/teamSlice";
import { CreateTeam } from "./components/team/CreateTeam";
import { JoinTeam } from "./components/team/JoinTeam";
import { LeaveTeamDialog } from "./components/team/LeaveTeamDialog";
import { ViewTeamDetailsDialog } from "./components/team/ViewTeamDetailsDialog";
import { teamDetailsApi } from "./api/teamDetails";
import { extractErrorMessage } from "./utils/errorHandling";
import { useNavigate } from "react-router";

export function ManageTeams() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { teams } = useSelector((state: RootState) => state.teams);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleLeaveGroup = async (teamId: string) => {
    try {
      await dispatch(removeTeam(teamId)).unwrap();

      // Check if there are no teams left after leaving
      const updatedTeams = teams.filter((team) => team.id !== teamId);
      if (updatedTeams.length === 0) {
        navigate("/teams/join");
      }
    } catch (error) {
      console.log("Manage Teams Error:", error);
      const errMsg =
        typeof error === "string" ? error : extractErrorMessage(error);
      throw new Error(errMsg);
    }
  };

  // Fetch team details for dialog
  const getTeamDetails = async (teamId: string) => {
    // Replace with actual API call
    const res = await teamDetailsApi.getDetails(teamId);
    return res;
  };

  const goToTeam = (teamId: string) => navigate(`/teams/${teamId}`);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <h3 className="text-lg sm:text-xl font-bold text-left mb-4">
        Available Teams
      </h3>
      <div className="mb-4 flex flex-row gap-2 items-center">
        <button
          className={`px-3 py-2 rounded text-sm ${
            viewMode === "table"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setViewMode("table")}
        >
          List View
        </button>
        <button
          className={`px-3 py-2 rounded text-sm ${
            viewMode === "card"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setViewMode("card")}
        >
          Card View
        </button>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto touch-auto">
          <table className="min-w-[320px] w-full rounded-lg bg-card border text-sm">
            <thead>
              <tr className="bg-card/60">
                <th className="py-2 px-2 sm:px-4 text-left font-semibold text-xs sm:text-sm">
                  Team Name
                </th>
                <th className="py-2 px-2 sm:px-4 text-center font-semibold text-xs sm:text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t">
                  <td className="py-2 px-2 sm:px-4 align-middle">
                    <button
                      className="text-primary hover:underline text-sm sm:text-base"
                      onClick={() => goToTeam(team.id)}
                    >
                      {team.name}
                    </button>
                  </td>
                  <td className="py-2 px-2 sm:px-4 align-middle">
                    <div className="flex flex-row gap-1 justify-center">
                      <LeaveTeamDialog team={team} onLeave={handleLeaveGroup} />
                      <ViewTeamDetailsDialog
                        team={team}
                        getTeamDetails={getTeamDetails}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-card border rounded-lg p-4 sm:p-6 flex flex-col items-start justify-between shadow-md"
            >
              <button
                className="font-semibold text-base sm:text-lg mb-4 text-left text-primary hover:underline"
                onClick={() => goToTeam(team.id)}
              >
                {team.name}
              </button>
              <div className="flex flex-col sm:flex-row gap-2 mt-auto w-full">
                <LeaveTeamDialog team={team} onLeave={handleLeaveGroup} />
                <ViewTeamDetailsDialog
                  team={team}
                  getTeamDetails={getTeamDetails}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-around gap-4 sm:gap-6 mt-8 sm:mt-12">
        <div className="w-full md:w-1/2">
          <CreateTeam
            description="Create a new team"
            onCreate={() => dispatch(fetchTeams())}
          />
        </div>
        <div className="w-full md:w-1/2">
          <JoinTeam
            description="Joining a new team? Enter the team code below"
            onJoin={() => dispatch(fetchTeams())}
          />
        </div>
      </div>
    </div>
  );
}
