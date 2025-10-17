import { useState, useEffect, useRef, useCallback } from "react";
import {
  type Column,
  type UserDetails,
  type Feature,
  type Project,
  type ToDoItem,
  type TodoStatus,
  type addTodoStatus,
} from "@/types/projects";
import { projectsApi } from "@/api/projects";
import { authApi } from "@/api/auth";
import { toast } from "sonner";
import { fetchTeams, setSelectedProjectId } from "@/features/teams/teamSlice";
import type { AppDispatch } from "@/lib/store";

type UseProjectDataParams = {
  dispatch: AppDispatch;
  teams: any[];
  isFetchingTeams: boolean;
  selectedTeam: any | null | undefined;
  selectedProjectId: string;
  isExecutive: boolean | null;
};

export function useProjectData({
  dispatch,
  teams,
  isFetchingTeams,
  selectedTeam,
  selectedProjectId,
  isExecutive,
}: UseProjectDataParams) {
  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [newColumn, setNewColumn] = useState<addTodoStatus>({
    name: "",
    color: "",
  });
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [proposedCounts, setProposedCounts] = useState<Record<string, number>>(
    {}
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const hasFetchedTeamsRef = useRef(false);
  const [rawTodos, setRawTodos] = useState<ToDoItem[]>([]);
  const [rawProposed, setRawProposed] = useState<ToDoItem[]>([]);

  // Helper to ensure color values are valid hex (prepend '#' if missing)
  const ensureHexColor = (c: string | undefined | null) => {
    const defaultColor = "#9ca3af"; // gray-400 as fallback
    if (!c) return defaultColor;
    const val = c.trim();
    if (!val) return defaultColor;
    return val.startsWith("#") ? val : `#${val}`;
  };

  // run on mount to prevent redux team stale data
  useEffect(() => {
    if (hasFetchedTeamsRef.current) return;
    hasFetchedTeamsRef.current = true;
    try {
      dispatch(fetchTeams());
    } catch (err) {
      console.error("Failed to dispatch fetchTeams:", err);
    }
  }, [dispatch]);

  // Load users whenever teams or project change
  useEffect(() => {
    (async () => {
      if (!teams.length) return;

      try {
        const teamMembers = teams.flatMap((team) => team.member_ids);
        const uniqueMemberIds = [...new Set(teamMembers)];

        const userPromises = uniqueMemberIds.map((id) =>
          authApi.getUserById(id)
        );
        const userResponses = await Promise.all(userPromises);

        const validUsers = userResponses.map((u) => u.user);

        setUsers(validUsers);
      } catch (err) {
        console.log("Failed to fetch users:", err);
      }
    })();
  }, [teams]);

  // Load available projects when selectedTeam changes
  useEffect(() => {
    (async () => {
      if (isFetchingTeams || !selectedTeam) return;

      setLoading(true);
      setLoadingStage(0);

      try {
        setLoadingStage(1);

        const projectPromises = selectedTeam.project_ids.map((id: string) =>
          projectsApi.getProject(id)
        );

        setLoadingStage(2);

        const projectResponses = await Promise.all(projectPromises);

        setAvailableProjects(projectResponses.map((r) => r.project));

        // Fetch proposed counts if executive
        if (isExecutive === true) {
          const proposedPromises = projectResponses.map((r) =>
            projectsApi
              .getProposedTodos(r.project.id)
              .then((res) => res.proposed_todos.length)
          );
          const counts = await Promise.all(proposedPromises);
          const newProposedCounts = projectResponses.reduce((acc, r, i) => {
            acc[r.project.id] = counts[i];
            return acc;
          }, {} as Record<string, number>);
          setProposedCounts(newProposedCounts);
        }

        // Handle project selection based on available projects
        if (projectResponses.length === 0) {
          // No projects in this team - clear everything
          dispatch(setSelectedProjectId(null));
          setProject(null);
          setFeatures([]);
          setColumns([]);
          setRawTodos([]);
          setRawProposed([]);
        } else if (!selectedProjectId) {
          // Has projects but none selected - select first project
          const firstProjectId = projectResponses[0].project.id;
          dispatch(setSelectedProjectId(firstProjectId));
          await loadProjectData(firstProjectId);
        } else {
          // Check if the currently selected project belongs to this team
          const projectExists = projectResponses.some(
            (r) => r.project.id === selectedProjectId
          );
          if (projectExists) {
            // Selected project exists in new team - load it
            await loadProjectData(selectedProjectId);
          } else {
            // Selected project doesn't exist in new team - select first project
            const firstProjectId = projectResponses[0].project.id;
            dispatch(setSelectedProjectId(firstProjectId));
            await loadProjectData(firstProjectId);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    })();
  }, [isFetchingTeams, selectedTeam?.id, dispatch]);

  const loadProjectData = useCallback(async (projectId: string) => {
    try {
      setLoadingStage(3);

      const [projectResponse, todoItemsResponse, proposedResponse] =
        await Promise.all([
          projectsApi.getProject(projectId),
          (async () => {
            setLoadingStage(4);
            return await projectsApi.getTodoItems(projectId);
          })(),
          (async () => {
            const res = await projectsApi.getProposedTodos(projectId);
            return res;
          })(),
        ]);

      setLoadingStage(5);

      if (projectResponse.project) {
        setProject(projectResponse.project);

        const statusColumns: Column[] =
          projectResponse.project.todo_statuses.map((status: TodoStatus) => ({
            id: status.id,
            name: status.name,
            color: ensureHexColor(status.color),
          }));
        setColumns(statusColumns);
      }

      setRawTodos(todoItemsResponse.todos || []);
      setRawProposed(proposedResponse.proposed_todos || []);

      setProposedCounts((prev) => ({
        ...prev,
        [projectId]: proposedResponse.proposed_todos.length,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStage(6);
    }
  }, []);

  // Effect to convert rawTodos and rawProposed to features once users/columns are ready
  useEffect(() => {
    const convertToFeatures = (
      items: ToDoItem[],
      isProposed: boolean
    ): Feature[] =>
      items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        column: item.status_id,
        owner: users.find((u) => u.id === item.assignee_id) || {
          id: "",
          email: "",
          first_name: "",
          last_name: "",
        },
        isProposed,
      }));

    const approvedFeatures = convertToFeatures(rawTodos, false);
    const proposedFeatures = convertToFeatures(rawProposed, true);

    const proposedIds = new Set(proposedFeatures.map((p) => p.id));
    const filteredApproved = approvedFeatures.filter(
      (a) => !proposedIds.has(a.id)
    );

    setFeatures([...proposedFeatures, ...filteredApproved]);
  }, [rawTodos, rawProposed, users, isExecutive]);

  const handleCreateProject = async (name: string, description: string) => {
    if (!selectedTeam) return false;

    try {
      setLoading(true);

      const response = await projectsApi.createProject(
        selectedTeam.id,
        name,
        description
      );

      if (response.project) {
        setAvailableProjects((prev) => [...prev, response.project]);
        setSelectedProjectId(response.project.id);
        dispatch(setSelectedProjectId(response.project.id));
        await loadProjectData(response.project.id);
        toast.success("Project created", { id: "project-created" });
        await dispatch(fetchTeams()).unwrap();
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project", { id: "project-create-failed" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedTeam || !selectedProjectId) return;

    try {
      setLoading(true);
      await projectsApi.deleteProject(selectedTeam.id, selectedProjectId);

      setAvailableProjects((prev) =>
        prev.filter((p) => p.id !== selectedProjectId)
      );

      setSelectedProjectId("");
      dispatch(setSelectedProjectId(null)); // Dispatch to Redux
      setProject(null);
      setFeatures([]);
      setColumns([]);

      // Refresh teams so project_ids updates
      try {
        await dispatch(fetchTeams()).unwrap();
      } catch (e) {
        console.log("Failed to refresh teams after delete", e);
      }

      toast.success("Project deleted", { id: "project-deleted" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project", { id: "project-delete-failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!project) return;

    try {
      await projectsApi.deleteTodo(project.id, itemId);

      setFeatures((prevFeatures) =>
        prevFeatures.filter((feature) => feature.id !== itemId)
      );
      toast.error("Task Deleted", { id: "delete-todo" });
    } catch (err) {
      console.log(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleUpdateItem = (itemId: string, updates: Partial<Feature>) => {
    const currentFeature = features.find((f) => f.id === itemId);
    if (!currentFeature) return;

    // keep a copy to allow rollback on failure
    const prevFeaturesSnapshot = [...features];

    // optimistic UI update
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === itemId ? { ...feature, ...updates } : feature
      )
    );

    if (project) {
      const apiData = {
        id: itemId,
        name: (updates as any).name ?? currentFeature.name,
        description: (updates as any).description ?? currentFeature.description,
        status_id: (updates as any).column ?? currentFeature.column,
        assignee_id: (updates as any).owner?.id ?? currentFeature.owner.id,
      };

      // Call API and show toast on success; revert optimistic update on failure.
      projectsApi
        .updateTodo(project.id, apiData)
        .then(() => {
          toast.success("Edit Applied", { id: `update-todo-${itemId}` });
        })
        .catch((err) => {
          // rollback optimistic update
          setFeatures(prevFeaturesSnapshot);
          toast.error("Failed to update task", {
            id: `update-todo-failed-${itemId}`,
          });
          console.error("Failed to update todo:", err);
        });
    }
  };

  const addColumn = async () => {
    if (!project) {
      toast.error("No project selected", { id: "no-project-selected" });
      return;
    }

    if (!newColumn.name.trim()) {
      toast.error("Column title cannot be empty", { id: "empty-column-name" });
      return;
    }

    try {
      setLoading(true);
      // Call API to add the todo status. Normalize the color first.
      const payload: addTodoStatus = {
        name: newColumn.name.trim(),
        color: ensureHexColor(newColumn.color),
      };
      await projectsApi.addTodoStatus(project.id, payload);
      await loadProjectData(project.id);

      // reset state
      setNewColumn({ name: "", color: "" });
      setIsAddingColumn(false);
      try {
        await dispatch(fetchTeams()).unwrap();
      } catch (e) {
        console.log("Failed to refresh teams after add status", e);
      }

      toast.success("Column added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add column");
    } finally {
      setLoading(false);
    }
  };

  // Load project data when selectedProjectId changes (but not during initial load)
  useEffect(() => {
    if (isInitialLoad || !selectedProjectId) return;
    loadProjectData(selectedProjectId);
  }, [selectedProjectId, isInitialLoad, loadProjectData]);

  return {
    loading,
    loadingStage,
    availableProjects,
    selectedProjectId,
    setSelectedProjectId,
    project,
    features,
    setFeatures,
    columns,
    users,
    loadProjectData,
    handleCreateProject,
    handleDeleteProject,
    handleDeleteItem,
    handleUpdateItem,
    newColumn,
    setNewColumn,
    isAddingColumn,
    setIsAddingColumn,
    addColumn,
    proposedCounts,
    isInitialLoad,
  } as const;
}
