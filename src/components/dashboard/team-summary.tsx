import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown, ArrowRight, Calendar, FolderOpen } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";

export function TeamSummary() {
  const navigate = useNavigate();
  const { selectedTeam, isFetchingTeams } = useSelector((state: RootState) => state.teams);

  if (isFetchingTeams) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!selectedTeam) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Summary
          </CardTitle>
          <CardDescription>
            Select a team to view summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate("/teams")}
            className="w-full"
          >
            Manage Teams
          </Button>
        </CardContent>
      </Card>
    );
  }

  const memberCount = selectedTeam.member_ids.length;
  const execCount = selectedTeam.exec_member_ids.length;
  const projectCount = selectedTeam.project_ids.length;
  const eventCount = selectedTeam.event_ids.length;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>{selectedTeam.name}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/teams/${selectedTeam.id}`)}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Team overview and quick access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Members</span>
            </div>
            <div className="text-xl font-bold">{memberCount}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Executives</span>
            </div>
            <div className="text-xl font-bold">{execCount}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <div className="text-lg font-semibold">{projectCount}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Events</span>
            </div>
            <div className="text-lg font-semibold">{eventCount}</div>
          </div>
        </div>


        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teams/${selectedTeam.id}`)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/projects")}
            className="flex-1"
          >
            Projects
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
