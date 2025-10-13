import { Kanban } from "@/components/projects/kanban";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ListView } from "./components/projects/list-view";
import { CreateTask } from "./components/projects/create-task";
import { KanbanItemSheet } from "@/components/projects/item-sheet";
import type { KanbanItemProps } from "@/components/projects";
import { ProgressLoading } from "@/components/ProgressLoading";
import SelectProject from "@/components/projects/select-project";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useProjectData } from "./hooks/useProjectData";
import CreateProject from "./components/projects/create-project";
import { DeleteProjectButton } from "./components/projects/delete-project";
import { AddColumnDialog } from "./components/projects/add-column";
import { ViewToggle } from "./components/projects/view-toggle";
import { useIsExecutive } from "./hooks/useIsExecutive";
import { useIsMobile } from "./hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";

import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "./lib/store";
import {
  setSelectedProjectId,
  setReloadProjectTodoId,
} from "@/features/teams/teamSlice";

export default function Projects() {
  const {
    teams,
    isFetchingTeams,
    selectedTeam,
    selectedProjectId,
    reloadProjectTodoId,
  } = useSelector((state: RootState) => state.teams);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const hasCheckedInitialState = useRef(false);
  const [selectedItem, setSelectedItem] = useState<KanbanItemProps | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();
  const isExecutive = useIsExecutive() ?? false;
  const isMobile = useIsMobile();
  const { DialogEl: ConfirmDialog } = useConfirm();
  const [view, setView] = useState<"kanban" | "list">("kanban");

  useEffect(() => {
    if (isMobile) {
      setView("list");
    }
  }, [isMobile]);
  const loadingStages = [
    "Fetching user teams...",
    "Loading available projects...",
    "Setting up project data...",
    "Loading project details...",
    "Fetching todo items...",
    "Preparing workspace...",
  ];

  const {
    loading,
    loadingStage,
    availableProjects,
    proposedCounts,
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
    isInitialLoad,
  } = useProjectData({
    dispatch,
    teams,
    isFetchingTeams,
    selectedTeam,
    selectedProjectId: selectedProjectId ?? "",
    isExecutive,
  });

  const hasProjects =
    (availableProjects?.length ?? 0) > 0 && !!selectedProjectId;

  const handleProjectChange = async (projectId: string) => {
    try {
      dispatch(setSelectedProjectId(projectId));
      await loadProjectData(projectId);
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to load project"
      );
    }
  };

  // Update reload useEffect to handle optimistic delete
  useEffect(() => {
    if (reloadProjectTodoId && selectedProjectId && !loading) {
      setFeatures((prev) => prev.filter((f) => f.id !== reloadProjectTodoId));
      dispatch(setReloadProjectTodoId(null));
      loadProjectData(selectedProjectId);
    }
  }, [
    reloadProjectTodoId,
    selectedProjectId,
    loading,
    loadProjectData,
    dispatch,
  ]);

  useEffect(() => {
    // Only check after initial load is truly complete
    if (isInitialLoad || loading) return;

    if (
      !hasCheckedInitialState.current &&
      availableProjects.length === 0 &&
      selectedTeam
    ) {
      hasCheckedInitialState.current = true;
      setIsCreateProjectOpen(true);
    }
  }, [isInitialLoad, loading, availableProjects.length, selectedTeam]);

  return (
    <div className="bg-background p-4 sm:p28 py-2 overflow-hidden">
      {ConfirmDialog}
      {loading ? (
        <ProgressLoading stages={loadingStages} currentStage={loadingStage} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start justify-between mt-2 mb-2 gap-2">
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Team: {selectedTeam?.name} • {availableProjects.length}{" "}
                    project(s)
                  </p>
                </div>
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <SelectProject
                      availableProjects={availableProjects}
                      selectedProjectId={selectedProjectId}
                      handleProjectChange={handleProjectChange}
                      proposedCounts={proposedCounts}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <CreateProject
                            open={isCreateProjectOpen}
                            onOpenChange={setIsCreateProjectOpen}
                            handleCreateProject={async (name, description) => {
                              const success = await handleCreateProject(
                                name,
                                description
                              );
                              if (success) {
                                setIsCreateProjectOpen(false);
                              }
                              return success;
                            }}
                            disabled={!isExecutive}
                          />
                        </div>
                      </TooltipTrigger>
                      {!isExecutive && (
                        <TooltipContent>
                          <p>Only executives can create projects</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DeleteProjectButton
                            handleDeleteProject={handleDeleteProject}
                            disabled={!selectedProjectId || !isExecutive}
                          />
                        </div>
                      </TooltipTrigger>
                      {!isExecutive && (
                        <TooltipContent>
                          <p>Only executives can delete projects</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end space-y-1 md:space-y-2">
              <CreateTask
                project={project}
                statuses={columns.map((c) => ({ id: c.id, name: c.name }))}
                users={users}
                onCreated={() => loadProjectData(selectedProjectId || "")}
              />
              {!isMobile && <ViewToggle view={view} onViewChange={setView} />}
            </div>
          </div>

          {hasProjects && (
            <AddColumnDialog
              open={isAddingColumn}
              onOpenChange={setIsAddingColumn}
              newColumn={newColumn}
              setNewColumn={setNewColumn}
              onSubmit={addColumn}
            />
          )}

          {view === "kanban" ? (
            <Kanban
              columns={columns}
              features={features}
              project={project}
              onFeaturesChange={setFeatures}
              onSelect={setSelectedItem}
              allowDrag={isExecutive ?? undefined}
              onColumnUpdated={() => {
                if (selectedProjectId) void loadProjectData(selectedProjectId);
              }}
              extraColumn={
                hasProjects ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => {
                            if (isExecutive) {
                              setIsAddingColumn(true);
                            }
                          }}
                          className={clsx(
                            "rounded-md border-2 border-dashed h-full p-3 flex items-start justify-center",
                            isExecutive
                              ? "border-muted-foreground/30 cursor-pointer hover:border-muted-foreground"
                              : "border-muted-foreground/20 cursor-not-allowed opacity-50"
                          )}
                        >
                          <div className="text-sm text-muted-foreground">
                            + Add Column
                          </div>
                        </div>
                      </TooltipTrigger>
                      {!isExecutive && (
                        <TooltipContent>
                          <p>Only executives can add columns</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ) : undefined
              }
            />
          ) : (
            <ListView
              items={features}
              columns={columns}
              onSelect={setSelectedItem}
            />
          )}

          <KanbanItemSheet
            item={selectedItem}
            open={!!selectedItem}
            onOpenChange={(open) => !open && setSelectedItem(null)}
            onDelete={handleDeleteItem}
            onUpdate={handleUpdateItem}
            columns={columns}
            users={users}
          />
        </>
      )}
    </div>
  );
}
