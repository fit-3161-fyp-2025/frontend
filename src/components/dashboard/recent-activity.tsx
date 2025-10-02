import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckSquare, Calendar, FolderOpen, Users } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'event_created' | 'project_updated' | 'member_joined';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  data?: any;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  const { selectedTeam } = useSelector((state: RootState) => state.teams);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'event_created':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'project_updated':
        return <FolderOpen className="h-4 w-4 text-purple-500" />;
      case 'member_joined':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'event_created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'project_updated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'member_joined':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Loading recent activity...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
              <div className="h-3 bg-muted rounded w-1/2 ml-7"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          {selectedTeam ? `${selectedTeam.name} activity` : 'Recent activity across all teams'} (Mock Data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-2">Activity will appear here as your team collaborates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{activity.title}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActivityColor(activity.type)}`}
                      >
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.user ? `${activity.user} • ` : ''}</span>
                      <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > 5 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Showing latest {activities.length} activities
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
