import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Clock, ArrowRight } from "lucide-react";
import type { ToDoItem } from "@/types/projects";
import { useNavigate } from "react-router";

interface UserTasksProps {
  userTasks: UserTaskWithProject[];
  isLoading?: boolean;
}

interface UserTaskWithProject extends ToDoItem {
  project_name: string;
  status_name: string;
  isCompleted: boolean;
}

export function UserTasks({ userTasks, isLoading = false }: UserTasksProps) {
  const navigate = useNavigate();

  // Sort tasks: pending first, then by project
  const sortedTasks = userTasks.sort((a, b) => {
    // Sort by completion status - incomplete first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1; // Incomplete first
    }
    return a.project_name.localeCompare(b.project_name);
  });

  const pendingTasks = sortedTasks.filter((task) => !task.isCompleted);
  const completedTasks = sortedTasks.filter((task) => task.isCompleted);

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Your Tasks
          </CardTitle>
          <CardDescription>Loading your tasks...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <CardTitle>Your Tasks</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/projects")}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Tasks assigned to you in this team</CardDescription>
      </CardHeader>
      <CardContent>
        {userTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks assigned to you</p>
            <p className="text-sm mt-2">
              Tasks will appear here when they're assigned to you
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate("/projects")}
            >
              View Projects
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium text-sm text-orange-700 dark:text-orange-300">
                    Pending ({pendingTasks.length})
                  </h4>
                </div>
                <div className="space-y-3">
                  {pendingTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate("/projects")}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h5 className="font-medium text-sm">{task.name}</h5>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={task.approved ? "default" : "secondary"}
                            className="text-xs ml-2 flex-shrink-0"
                          >
                            {task.status_name}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">
                            {task.project_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {pendingTasks.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{pendingTasks.length - 3} more pending tasks
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium text-sm text-green-700 dark:text-green-300">
                    Completed ({completedTasks.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {completedTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer opacity-75"
                      onClick={() => navigate("/projects")}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <h5 className="font-medium text-sm line-through text-muted-foreground">
                            {task.name}
                          </h5>
                          <span className="text-xs text-muted-foreground">
                            {task.project_name}
                          </span>
                        </div>
                        <CheckSquare className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                      </div>
                    </div>
                  ))}

                  {completedTasks.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{completedTasks.length - 2} more completed tasks
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total assigned: {userTasks.length}</span>
                <span>
                  {completedTasks.length}/{userTasks.length} completed
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
