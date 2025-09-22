import { useAppDispatch } from "@/hooks/redux";
import type { RootState } from "@/lib/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../ui/select";
import { fetchTeams, setSelectedTeamById } from "@/features/teams/teamSlice";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

export function TeamsMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { teams, isFetchingTeams, selectedTeam } = useSelector((state: RootState) => state.teams);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleTeamChange = (teamId: string) => {
    dispatch(setSelectedTeamById(teamId));
  }

  const navToManageTeam = () => {
    setIsOpen(false);
    navigate("/teams");
  }

  return (
    <Select
      disabled={isFetchingTeams}
      value={selectedTeam?.id || ""}
      onValueChange={handleTeamChange}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isFetchingTeams ? "Loading..." : "Select Team"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Teams</SelectLabel>
          {teams.map(team => (
            <SelectItem value={team.id} key={team.id}>
              {team.name}
            </SelectItem>
          ))}
          <Button
            className="w-full mt-2"
            onClick={navToManageTeam}
          >
            Manage Teams
          </Button>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
