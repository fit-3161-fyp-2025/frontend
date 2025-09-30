import { useState, useEffect } from "react";
import { userIsExecutive } from "@/hooks/userIsExecutive";
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
import type { ToDoItem } from "@/types/projects";
import { ListViewStatusBadge } from "@/utils/statusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Inbox() {
  const isExecutive = userIsExecutive();
  const { selectedProjectId } = useAppSelector((state) => state.teams);
  const [proposedTodos, setProposedTodos] = useState<ToDoItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isExecutive || !selectedProjectId) {
      setProposedTodos([]);
      return;
    }

    const fetchProposedTodos = async () => {
      setLoading(true);
      try {
        const response = await projectsApi.getProposedTodos(selectedProjectId);
        setProposedTodos(response.proposed_todos);
      } catch (error) {
        console.error("Error fetching proposed todos:", error);
        toast.error("Failed to load proposed tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchProposedTodos();
  }, [isExecutive, selectedProjectId]);

  const handleApproveTodo = async (todoId: string) => {
    try {
      await projectsApi.approveTodo(todoId);
      setProposedTodos((prev) => prev.filter((todo) => todo.id !== todoId));
      toast.success("Task approved successfully");
    } catch (error) {
      console.error("Error approving todo:", error);
      toast.error("Failed to approve task");
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
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Proposed Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-64">
          {loading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : proposedTodos.length === 0 ? (
            <DropdownMenuItem disabled>No proposed tasks</DropdownMenuItem>
          ) : (
            proposedTodos.map((todo) => (
              <DropdownMenuItem
                key={todo.id}
                className="flex flex-col items-start gap-2 p-2"
              >
                <div className="flex w-full justify-between items-center">
                  <span className="font-medium truncate max-w-[200px]">
                    {todo.name}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApproveTodo(todo.id)}
                  >
                    Approve
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground truncate w-full">
                  {todo.description}
                </div>
                <ListViewStatusBadge status={todo.status_id} />
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
