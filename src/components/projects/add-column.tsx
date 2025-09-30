import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { addTodoStatus } from "@/types/projects";

type AddColumnDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newColumn: addTodoStatus;
  setNewColumn: React.Dispatch<React.SetStateAction<addTodoStatus>>;
  onSubmit: () => Promise<void>;
};

export function AddColumnDialog({
  open,
  onOpenChange,
  newColumn,
  setNewColumn,
  onSubmit,
}: AddColumnDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label className="text-sm">Column Title</Label>
              <Input
                value={newColumn.name}
                onChange={(e) =>
                  setNewColumn({ ...newColumn, name: e.target.value })
                }
                placeholder="Enter column title"
                required
                className="w-full rounded border px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div className="grid gap-3">
              <Label className="text-sm">Colour Label</Label>
              <div className="flex gap-2 my-2">
                {[
                  "#ef4444",
                  "#f97316",
                  "#f59e0b",
                  "#10b981",
                  "#06b6d4",
                  "#3b82f6",
                  "#6366f1",
                  "#8b5cf6",
                  "#ec4899",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColumn({ ...newColumn, color: c })}
                    className={
                      "w-8 h-8 rounded-full border-2 " +
                      (newColumn.color === c ? "ring-2 ring-offset-1" : "")
                    }
                    style={{ background: c }}
                    aria-label={`select ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Column</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
