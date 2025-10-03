import { useState, useEffect } from "react";
import { useIsExecutive } from "@/hooks/useIsExecutive";
import { projectsApi } from "@/api/projects";
import { useAppSelector } from "@/hooks/redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import type { ToDoItem, TodoStatus } from "@/types/projects";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListViewStatusBadge } from "@/utils/statusBadge";

type InboxProps = {
  onApproved?: (todoId: string) => void;
};

type StatusMap = Record<string, { name: string; color: string | undefined }>;

export function Inbox({ onApproved }: InboxProps) {
  const isExecutive = useIsExecutive();
  const { selectedProjectId } = useAppSelector((state) => state.teams);
  const [proposedTodos, setProposedTodos] = useState<ToDoItem[]>([]);
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isExecutive || !selectedProjectId) {
      setProposedTodos([]);
      setStatusMap({});
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const proposedRes = await projectsApi.getProposedTodos(
          selectedProjectId
        );
        setProposedTodos(proposedRes.proposed_todos);

        const projectRes = await projectsApi.getProject(selectedProjectId);
        const map = projectRes.project.todo_statuses.reduce(
          (acc, status: TodoStatus) => {
            acc[status.id] = { name: status.name, color: status.color };
            return acc;
          },
          {} as StatusMap
        );
        setStatusMap(map);
      } catch (error) {
        console.error("Failed to load inbox data:", error);
        toast.error("Failed to load proposed tasks or statuses");
        setProposedTodos([]);
        setStatusMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isExecutive, selectedProjectId]);

  const handleApproveTodo = async (projectId: string, todoId: string) => {
    try {
      await projectsApi.approveTodo(projectId, todoId);
      setProposedTodos((prev) => prev.filter((todo) => todo.id !== todoId));
      toast.success("Task approved successfully");
      onApproved?.(todoId);
    } catch (error) {
      toast.error("Failed to approve task");
    }
  };

  const handleRejectTodo = async (projectId: string, todoId: string) => {
    try {
      await projectsApi.deleteTodo(projectId, todoId);
      setProposedTodos((prev) => prev.filter((todo) => todo.id !== todoId));
      toast.success("Task rejected");
      onApproved?.(todoId);
    } catch (error) {
      toast.error("Failed to reject task");
    }
  };

  if (!isExecutive) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {proposedTodos.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
              {proposedTodos.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-90">
        <DropdownMenuLabel>Proposed Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-74">
          {loading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : proposedTodos.length === 0 ? (
            <DropdownMenuItem disabled>No proposed tasks</DropdownMenuItem>
          ) : (
            proposedTodos.map((todo) => {
              const status = statusMap[todo.status_id] || {
                name: todo.status_id || "Unassigned",
                color: undefined,
              };
              return (
                <DropdownMenuItem
                  key={todo.id}
                  className="flex flex-col items-start gap-2 p-2 m-1"
                >
                  <div className="flex w-full justify-between items-center">
                    <span className="font-medium truncate max-w-[200px]">
                      {todo.name}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          selectedProjectId &&
                          handleApproveTodo(selectedProjectId, todo.id)
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          selectedProjectId &&
                          handleRejectTodo(selectedProjectId, todo.id)
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate w-full">
                    {todo.description}
                  </div>
                  <ListViewStatusBadge
                    status={status.name}
                    color={status.color}
                  />
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
