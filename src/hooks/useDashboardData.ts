import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { teamApi } from "@/api/team";
import { projectsApi } from "@/api/projects";
import type { RootState } from "@/lib/store";
import type { EventModel } from "@/types/team";
import type { Project } from "@/types/projects";

export interface DashboardData {
  events: EventModel[];
  projects: Project[];
  totalTasksCompleted: number;
  activeProjectsCount: number;
  upcomingEventsCount: number;
  completedEventsCount: number;
  activities: ActivityItem[];
  userTasks: UserTaskWithProject[];
}

interface UserTaskWithProject {
  id: string;
  name: string;
  description: string;
  status_id: string;
  assignee_id: string;
  approved: boolean;
  project_name: string;
  status_name: string;
  isCompleted: boolean;
}

interface ActivityItem {
  id: string;
  type:
    | "task_completed"
    | "event_created"
    | "project_updated"
    | "member_joined";
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  data?: any;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    events: [],
    projects: [],
    totalTasksCompleted: 0,
    activeProjectsCount: 0,
    upcomingEventsCount: 0,
    completedEventsCount: 0,
    activities: [],
    userTasks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedTeam } = useSelector((state: RootState) => state.teams);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!selectedTeam) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch team events
        const eventsResponse = await teamApi.getTeamEvents(selectedTeam.id);
        const events = eventsResponse.events || [];

        // Fetch projects data for each project ID
        const projectPromises = selectedTeam.project_ids.map(
          async (projectId) => {
            try {
              const projectResponse = await projectsApi.getProject(projectId);
              return projectResponse.project;
            } catch (error) {
              console.error(`Failed to fetch project ${projectId}:`, error);
              return null;
            }
          }
        );

        const projects = (await Promise.all(projectPromises)).filter(
          (project): project is Project => project !== null
        );

        // Fetch todo items for each project to calculate completed tasks
        const todoPromises = projects.map(async (project) => {
          try {
            const todosResponse = await projectsApi.getTodoItems(project.id);
            return {
              todos: todosResponse.todos || [],
              project: project,
            };
          } catch (error) {
            console.error(
              `Failed to fetch todos for project ${project.id}:`,
              error
            );
            return {
              todos: [],
              project: project,
            };
          }
        });

        const todosWithProjects = await Promise.all(todoPromises);
        const allTodos = todosWithProjects.flatMap((t) => t.todos);

        // Calculate completed tasks - tasks in the rightmost column (last status) of each project
        const totalTasksCompleted = todosWithProjects.reduce(
          (count, { todos, project }) => {
            // Get the rightmost column (last status) ID
            const lastColumnId =
              project.todo_statuses[project.todo_statuses.length - 1]?.id;

            if (!lastColumnId) return count;

            // Count todos in the last column
            const completedInProject = todos.filter(
              (todo) => todo.status_id === lastColumnId
            ).length;
            return count + completedInProject;
          },
          0
        );

        // Calculate stats
        const now = new Date();
        const oneMonthFromNow = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        const upcomingEventsCount = events.filter((event) => {
          const eventDate = new Date(event.start);
          return eventDate > now && eventDate <= oneMonthFromNow;
        }).length;

        const completedEventsCount = events.filter((event) => {
          const eventDate = new Date(event.end);
          return eventDate < now;
        }).length;

        const activeProjectsCount = projects.length;

        // Filter tasks assigned to current user and enrich with project info
        const userTasks: UserTaskWithProject[] = allTodos
          .map((todo) => {
            const project = projects.find((p) => p.todo_ids.includes(todo.id));
            const status = project?.todo_statuses.find(
              (s) => s.id === todo.status_id
            );

            // Check if task is in the last column (completed)
            const lastColumnId =
              project?.todo_statuses[project.todo_statuses.length - 1]?.id;
            const isCompleted = lastColumnId === todo.status_id;

            return {
              ...todo,
              project_name: project?.name || "Unknown Project",
              status_name: status?.name || "Unknown Status",
              isCompleted,
            };
          })
          .filter(() => {
            // Filter tasks for current team only
            // Since we don't have user ID matching, show all tasks from current team
            // In a real app, you'd match assignee_id with user ID
            return true; // Show all tasks from current team for now
          });

        setData({
          events,
          projects,
          totalTasksCompleted,
          activeProjectsCount,
          upcomingEventsCount,
          completedEventsCount,
          activities: [],
          userTasks,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [selectedTeam]);

  return { data, isLoading, error };
}
