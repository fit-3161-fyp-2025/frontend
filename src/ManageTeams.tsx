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
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleLeaveGroup = async (teamId: string) => {
    try {
      await dispatch(removeTeam(teamId)).unwrap();
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
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-left mb-8">Manage Teams</h1>

      <h2 className="text-xl font-bold text-left mb-4">My Teams</h2>
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${
            viewMode === "table" ? "bg-purple-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewMode("table")}
        >
          List View
        </button>
        <button
          className={`px-4 py-2 rounded ${
            viewMode === "card" ? "bg-purple-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setViewMode("card")}
        >
          Card View
        </button>
      </div>
      
      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="min-w-[400px] w-full border border-gray-200 rounded-lg bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left font-semibold">Team Name</th>
                <th className="py-2 px-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t">
                  <td className="py-2 px-4 align-middle">
                    <button
                      className="text-purple-600 hover:underline"
                      onClick={() => goToTeam(team.id)}
                    >
                      {team.name}
                    </button>
                  </td>
                  <td className="py-2 px-4 align-middle">
                    <div className="flex flex-row gap-2 justify-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-start justify-between shadow-md"
            >
              <button
                className="font-semibold text-lg mb-4 text-left text-purple-600 hover:underline"
                onClick={() => goToTeam(team.id)}
              >
                {team.name}
              </button>
              <div className="flex flex-row gap-2 mt-auto">
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

      <div className="flex justify-around mt-12">
        <CreateTeam
          description="Create a new team"
          onCreate={() => dispatch(fetchTeams())}
        />
        <JoinTeam
          description="Joining a new team? Enter the team code below"
          onJoin={() => dispatch(fetchTeams())}
        />
      </div>
    </div>
  );
}
