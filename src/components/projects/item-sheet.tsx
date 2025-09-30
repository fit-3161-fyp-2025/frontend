import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserIcon, HashIcon, Trash2Icon, CornerDownRight } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useState, useEffect } from "react";
import type { KanbanItemProps } from "./index";
import type { Column, UserDetails } from "@/types/projects";

import { ItemSheetAvatar } from "@/components/ui/user-avatar";
import { ItemSheetStatusBadge } from "@/utils/statusBadge";

// Reusable editable wrapper component
const EditableField = ({
  children,
  onClick,
  canEdit,
  className = "cursor-pointer hover:bg-muted/70 hover:shadow-sm rounded-lg px-2 py-1 transition-all duration-200 border-2 border-transparent hover:border-muted-foreground/20",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  canEdit?: boolean;
  className?: string;
}) => {
  if (!canEdit) return <>{children}</>;

  return (
    <div className={className} onClick={onClick} title="Edit">
      {children}
    </div>
  );
};

type KanbanItemSheetProps = {
  item: KanbanItemProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (itemId: string) => void;
  onUpdate?: (itemId: string, updates: Partial<KanbanItemProps>) => void;
  columns?: Column[];
  users?: UserDetails[];
};

export function KanbanItemSheet({
  item,
  open,
  onOpenChange,
  onDelete,
  onUpdate,
  columns = [],
  users = [],
}: KanbanItemSheetProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    name?: string;
    description?: string;
    column?: string;
    startAt?: string;
    endAt?: string;
  }>({});

  const [localItem, setLocalItem] = useState<KanbanItemProps | null>(
    item ?? null
  );

  useEffect(() => {
    setLocalItem(item ?? null);
  }, [item]);

  // Reset editing state when sheet opens/closes
  useEffect(() => {
    if (!open) {
      setEditingField(null);
      setEditValues({});
    }
  }, [open]);

  const getColumnName = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    return column?.name || columnId;
  };

  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: currentValue });
  };

  const saveEdit = (field: string) => {
    if (
      onUpdate &&
      localItem &&
      editValues[field as keyof typeof editValues] !== undefined
    ) {
      const value = editValues[field as keyof typeof editValues];

      setLocalItem((prev) => {
        const updated = prev ? { ...prev, [field]: value } : prev;
        if (updated) onUpdate(updated.id, { [field]: value });
        return updated;
      });
    }

    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const { confirm, DialogEl: ConfirmDialog } = useConfirm();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {ConfirmDialog}
      <SheetContent className="w-full sm:max-w-md p-2">
        {localItem && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="border-b-4 p-4">
              <div className="space-y-4 space-x-4 break-words">
                {/* Title Section */}
                {editingField === "name" ? (
                  <div>
                    <Input
                      value={editValues.name || ""}
                      onChange={(e) => setEditValues({ name: e.target.value })}
                      className="text-2xl font-semibold"
                      autoFocus
                      onBlur={() => saveEdit("name")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit("name");
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <CornerDownRight className="h-4 w-4" aria-hidden="true" />
                      <span>Enter to save</span>
                    </div>
                  </div>
                ) : (
                  <EditableField
                    canEdit={!!onUpdate}
                    onClick={() => startEdit("name", localItem!.name)}
                    className="space-x-6 text-2xl font-semibold leading-tight cursor-pointer hover:bg-muted/70 hover:shadow-sm rounded-lg px-2 py-1 transition-all duration-200 border-2 border-transparent hover:border-muted-foreground/20"
                  >
                    {localItem!.name}
                  </EditableField>
                )}

                {/* Status Section */}
                <div className="flex items-center gap-2 text-base overflow-auto">
                  <span className="text-base text-muted-foreground">
                    Status:
                  </span>
                  {editingField === "column" ? (
                    <Select
                      value={editValues.column || ""}
                      onValueChange={(value) => {
                        setLocalItem((prev) => {
                          const updated = prev
                            ? { ...prev, column: value }
                            : prev;
                          if (updated && onUpdate)
                            onUpdate(updated.id, { column: value });
                          return updated;
                        });
                        cancelEdit();
                      }}
                    >
                      <SelectTrigger className="flex-0 max-w-80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="truncate">
                        {columns.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <EditableField
                      canEdit={!!onUpdate}
                      onClick={() => startEdit("column", localItem!.column)}
                    >
                      <ItemSheetStatusBadge
                        status={getColumnName(localItem!.column ?? "")}
                      />
                    </EditableField>
                  )}
                </div>
              </div>
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 pt-6 space-y-6 p-4">
              {/* Owner Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-base font-medium text-foreground">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Owner</span>
                </div>
                <div className="pl-6">
                  {editingField === "owner" ? (
                    <Select
                      defaultValue={(localItem!.owner as any)?.id || ""}
                      onValueChange={(value) => {
                        const selectedUser = users.find((u) => u.id === value);
                        if (selectedUser && onUpdate) {
                          setLocalItem((prev) => {
                            const updated = prev
                              ? { ...prev, owner: selectedUser }
                              : prev;
                            if (updated)
                              onUpdate(updated.id, { owner: selectedUser });
                            return updated;
                          });
                        }
                        cancelEdit();
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <EditableField
                      canEdit={!!onUpdate}
                      onClick={() => startEdit("owner", localItem!.owner)}
                    >
                      <div className="flex items-center gap-2">
                        <ItemSheetAvatar owner={localItem!.owner} />
                      </div>
                    </EditableField>
                  )}
                </div>
              </div>

              {/* Task Description Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-base font-medium text-foreground">
                  <span>Description</span>
                </div>
                <div className="pl-0 break-words">
                  {editingField === "description" ? (
                    <div>
                      <textarea
                        value={editValues.description || ""}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter task description..."
                        className="w-full min-h-[120px] p-3 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        autoFocus
                        onBlur={() => saveEdit("description")}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") cancelEdit();
                          // Enter (without Shift) saves and closes edit
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            saveEdit("description");
                          }
                        }}
                      />
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <CornerDownRight
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>Enter to save (Shift+Enter for newline)</span>
                      </div>
                    </div>
                  ) : (
                    <EditableField
                      canEdit={!!onUpdate}
                      onClick={() =>
                        startEdit("description", localItem?.description || "")
                      }
                      className="cursor-pointer hover:bg-muted/70 hover:shadow-sm rounded-lg p-3 transition-all duration-200 border-2 border-transparent hover:border-muted-foreground/20 min-h-[80px] block"
                    >
                      {localItem?.description ? (
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {localItem.description}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          No description - click to add
                        </span>
                      )}
                    </EditableField>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Button */}
            {onDelete && (
              <div className="border-t border-border p-4 mt-auto">
                {/* ID Section */}
                <div className="flex items-center gap-2 text-base font-medium text-foreground text-sm">
                  <HashIcon className="h-4 w-4" />
                  Task ID
                  <div className="p-4 text-sm text-muted-foreground">
                    {localItem!.id}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    confirm({
                      title: "Delete task?",
                      description:
                        "This will permanently delete the task. This action cannot be undone.",
                      onConfirm: () => {
                        if (localItem) onDelete?.(localItem.id);
                        onOpenChange(false);
                      },
                    });
                  }}
                  className="w-full"
                >
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
