import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Props = {
  currentColor?: string;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
};

export function KanbanColDropdown({
  currentColor,
  onChangeColor,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const { confirm, DialogEl } = useConfirm();

  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
  ];

  const handleDelete = () => {
    confirm({
      title: "Delete column?",
      description: "This will permanently delete the column and its tasks.",
      onConfirm: () => {
        onDelete();
        setOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuLabel>Column</DropdownMenuLabel>
          <DropdownMenuGroup>
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2">Color</div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onChangeColor(c);
                      setOpen(false);
                    }}
                    aria-label={`Set color ${c}`}
                    className={
                      "w-7 h-7 rounded-full border-2" +
                      (currentColor === c ? " ring-2 ring-offset-1" : "")
                    }
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onSelect={handleDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {DialogEl}
    </>
  );
}
