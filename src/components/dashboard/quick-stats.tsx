import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, FolderOpen, CheckSquare } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickStatsProps {
  upcomingEventsCount: number;
  completedEventsCount: number;
  activeProjectsCount: number;
  totalTasksCompleted: number;
}

export function QuickStats({ 
  upcomingEventsCount, 
  activeProjectsCount, 
  totalTasksCompleted 
}: QuickStatsProps) {
  const { selectedTeam, isFetchingTeams } = useSelector((state: RootState) => state.teams);

  if (isFetchingTeams) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Upcoming Events
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{upcomingEventsCount}</CardTitle>
          <CardDescription className="text-sm">
            Events in the next month
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Team Members
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {selectedTeam?.member_ids.length || 0}
          </CardTitle>
          <CardDescription className="text-sm">
            {selectedTeam ? `${selectedTeam.name} members` : "No team selected"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Projects
          </CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{activeProjectsCount}</CardTitle>
          <CardDescription className="text-sm">
            Projects in progress
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tasks Completed
          </CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{totalTasksCompleted}</CardTitle>
          <CardDescription className="text-sm">
            This month across all projects
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}