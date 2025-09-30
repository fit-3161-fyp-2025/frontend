import { Kanban } from "@/components/projects/kanban";
import { useState } from "react";
import { ListView } from "./components/projects/list-view";
import { CreateTask } from "./components/projects/create-task";
import { KanbanItemSheet } from "@/components/projects/item-sheet";
import type { KanbanItemProps } from "@/components/projects";
import { ProgressLoading } from "@/components/ProgressLoading";
import SelectProject from "@/components/projects/select-project";
import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "./lib/store";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useProjectData } from "./hooks/useProjectData";
import CreateProject from "./components/projects/create-project";
import { setSelectedProjectId } from "@/features/teams/teamSlice";
import { DeleteProjectButton } from "./components/projects/delete-project";
import { AddColumnDialog } from "./components/projects/add-column";
import { ViewToggle } from "./components/projects/view-toggle";

export default function Projects() {
  const { teams, isFetchingTeams, selectedTeam, selectedProjectId } =
    useSelector((state: RootState) => state.teams);

  const [selectedItem, setSelectedItem] = useState<KanbanItemProps | null>(
    null
  );
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const loadingStages = [
    "Fetching user teams...",
    "Loading available projects...",
    "Setting up project data...",
    "Loading project details...",
    "Fetching todo items...",
    "Preparing workspace...",
  ];

  const dispatch = useDispatch<AppDispatch>();

  const { DialogEl: ConfirmDialog } = useConfirm();

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
  } = useProjectData({
    dispatch,
    teams,
    isFetchingTeams,
    selectedTeam,
    selectedProjectId: selectedProjectId ?? "",
  });

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

  return (
    <div className="bg-background p-8 py-2">
      {ConfirmDialog}
      {loading ? (
        <ProgressLoading stages={loadingStages} currentStage={loadingStage} />
      ) : (
        <>
          <div className="flex items-start justify-between mt-2 mb-2">
            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Team: {selectedTeam?.name} • {availableProjects.length}{" "}
                    project(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SelectProject
                    availableProjects={availableProjects}
                    selectedProjectId={selectedProjectId}
                    handleProjectChange={handleProjectChange}
                    proposedCounts={proposedCounts}
                  />
                  <CreateProject handleCreateProject={handleCreateProject} />
                  <DeleteProjectButton
                    handleDeleteProject={handleDeleteProject}
                    disabled={!selectedProjectId}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <CreateTask
                project={project}
                statuses={columns.map((c) => ({ id: c.id, name: c.name }))}
                users={users}
                onCreated={() => loadProjectData(selectedProjectId || "")}
              />
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>

          <AddColumnDialog
            open={isAddingColumn}
            onOpenChange={setIsAddingColumn}
            newColumn={newColumn}
            setNewColumn={setNewColumn}
            onSubmit={addColumn}
          />

          {view === "kanban" ? (
            <Kanban
              columns={columns}
              features={features}
              project={project}
              onFeaturesChange={setFeatures}
              onSelect={setSelectedItem}
              onColumnUpdated={() => {
                if (selectedProjectId) void loadProjectData(selectedProjectId);
              }}
              extraColumn={
                <div
                  onClick={() => setIsAddingColumn(true)}
                  className="cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/30 h-full p-3 flex items-start justify-center"
                >
                  <div className="text-sm text-muted-foreground">
                    + Add Column
                  </div>
                </div>
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
