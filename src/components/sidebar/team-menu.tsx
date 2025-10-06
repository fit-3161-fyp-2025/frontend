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
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TeamsMenu() {
  const dispatch = useAppDispatch();
  const { state: sidebarState } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const { teams, isFetchingTeams, selectedTeam } = useSelector(
    (state: RootState) => state.teams
  );

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleTeamChange = (teamId: string) => {
    dispatch(setSelectedTeamById(teamId));
  };

  // When the sidebar is collapsed we show a compact avatar-only trigger with tooltip
  // otherwise show the full Select control.
  const isCollapsed = sidebarState === "collapsed";

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen((v) => !v)}
              aria-label={selectedTeam?.name ?? "Select team"}
              className="relative"
            >
              <Avatar className="size-6">
                <AvatarFallback>
                  {selectedTeam?.name?.[0] ?? "T"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" hidden={false}>
            <div className="max-w-xs truncate">
              {selectedTeam?.name ??
                (isFetchingTeams ? "Loading..." : "No team")}
            </div>
          </TooltipContent>
        </Tooltip>

        <Select
          disabled={isFetchingTeams}
          value={selectedTeam?.id || ""}
          onValueChange={handleTeamChange}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Your Teams</SelectLabel>
              {teams.map((team) => (
                <SelectItem value={team.id} key={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
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
        <SelectValue
          placeholder={isFetchingTeams ? "Loading..." : "Select Team"}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Your Teams</SelectLabel>
          {teams.map((team) => (
            <SelectItem value={team.id} key={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
