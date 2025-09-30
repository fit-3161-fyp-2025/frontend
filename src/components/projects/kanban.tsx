import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type KanbanItemProps,
} from "@/components/projects";
import type { Column, Feature, Project } from "@/types/projects";
import { KanbanAvatar } from "@/components/ui/user-avatar";
import { useEffect, useRef, useState } from "react";
import { projectsApi } from "@/api/projects";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KanbanColDropdown } from "./kanban-col-dropdown";

interface KanbanProps {
  columns: Column[];
  features: Feature[];
  project: Project | null;
  onFeaturesChange: (features: Feature[]) => void;
  onSelect: React.Dispatch<React.SetStateAction<KanbanItemProps | null>>;
  extraColumn?: React.ReactNode;
  onColumnUpdated?: (detail: {
    id: string;
    action: "rename" | "delete" | "color";
    color?: string;
  }) => void;
  allowDrag?: boolean;
}

export function Kanban({
  columns,
  features,
  project,
  onFeaturesChange,
  onSelect,
  extraColumn,
  onColumnUpdated,
  allowDrag,
}: KanbanProps) {
  const prevFeaturesRef = useRef<Feature[]>([]);

  // Track changes in features and detect column moves for backend sync
  useEffect(() => {
    // Skip first render and if there are no previous features
    if (prevFeaturesRef.current.length === 0) {
      prevFeaturesRef.current = features.map((f) => ({ ...f })); // Deep copy
      return;
    }

    // Find any feature that changed columns
    const movedFeature = features.find((newFeature) => {
      const oldFeature = prevFeaturesRef.current.find(
        (old) => old.id === newFeature.id
      );
      return oldFeature && oldFeature.column !== newFeature.column;
    });

    if (movedFeature && project) {
      projectsApi
        .updateTodo(project.id, {
          id: movedFeature.id,
          name: movedFeature.name,
          description: movedFeature.description,
          status_id: movedFeature.column,
          assignee_id: movedFeature.owner.id,
        })
        .catch((err) => {
          console.error("Failed to update todo status in backend:", err);
        });
    }

    // Update the ref with current features (deep copy to avoid reference issues)
    prevFeaturesRef.current = features.map((f) => ({ ...f }));
  }, [features, project]);

  const handleKanbanChange = (value: React.SetStateAction<Feature[]>) => {
    const newFeatures = typeof value === "function" ? value(features) : value;
    onFeaturesChange(newFeatures);
  };

  function ColumnView({ column }: { column: Column }) {
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(column.name);

    useEffect(() => {
      setNameValue(column.name);
    }, [column.name]);

    const saveName = async () => {
      if (!project) return;
      const trimmed = (nameValue || "").trim();
      if (!trimmed) {
        toast.error("Column name cannot be empty");
        return;
      }
      try {
        await projectsApi.updateTodoStatus(project.id, {
          id: column.id,
          name: trimmed,
          color: column.color,
        });
        toast.success("Column renamed: " + trimmed);
        setEditingName(false);
        onColumnUpdated?.({ id: column.id, action: "rename" });
      } catch (err) {
        console.error("Failed to rename column:", err);
        toast.error("Failed to rename column");
      }
    };

    return (
      <KanbanBoard id={column.id} key={column.id}>
        <KanbanHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              {editingName ? (
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  autoFocus
                  onBlur={() => saveName()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveName();
                    }
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNameValue(column.name);
                    }
                  }}
                />
              ) : (
                <span
                  className="cursor-pointer max-w-[13rem] truncate block"
                  onClick={() => setEditingName(true)}
                  title={column.name}
                >
                  {column.name}
                </span>
              )}
            </div>
            <div className="ml-2">
              <KanbanColDropdown
                currentColor={column.color}
                onChangeColor={async (c: string) => {
                  if (!project) return;
                  await projectsApi.updateTodoStatus(project.id, {
                    id: column.id,
                    name: column.name,
                    color: c,
                  });
                  onColumnUpdated?.({
                    id: column.id,
                    action: "color",
                    color: c,
                  });
                  toast.success("Column color updated");
                }}
                onDelete={async () => {
                  if (!project) return;
                  try {
                    await projectsApi.deleteTodoStatus(project.id, column.id);
                    onColumnUpdated?.({ id: column.id, action: "delete" });
                    toast.success("Column deleted");
                  } catch (err) {
                    console.error("Failed to delete column:", err);
                    toast.error("Failed to delete column");
                  }
                }}
              />
            </div>
          </div>
        </KanbanHeader>
        <KanbanCards id={column.id}>
          {(feature: Feature) => (
            <KanbanCard
              column={column.id}
              id={feature.id}
              key={feature.id}
              name={feature.name}
              owner={feature.owner}
              onClick={() => onSelect(feature)}
              disabled={!allowDrag}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm line-clamp-1 truncate max-w-70">
                    {feature.name}
                  </p>
                </div>
                {feature.owner && <KanbanAvatar owner={feature.owner} />}
              </div>
              <div className="text-muted-foreground text-xs max-w-60 line-clamp-1 truncate">
                {feature.description}
              </div>
            </KanbanCard>
          )}
        </KanbanCards>
      </KanbanBoard>
    );
  }

  return (
    <KanbanProvider
      columns={columns}
      data={features}
      onDataChange={handleKanbanChange}
      extraColumn={extraColumn}
    >
      {(column) => <ColumnView column={column} />}
    </KanbanProvider>
  );
}
