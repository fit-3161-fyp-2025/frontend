import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";

type DeleteProjectButtonProps = {
  handleDeleteProject: () => Promise<void>;
  disabled?: boolean;
};

export function DeleteProjectButton({
  handleDeleteProject,
  disabled,
}: DeleteProjectButtonProps) {
  const { confirm, DialogEl: ConfirmDialog } = useConfirm();

  const handleDeleteClick = () => {
    confirm({
      title: "Delete Project",
      description:
        "Are you sure you want to delete this project? This action cannot be undone.",
      onConfirm: handleDeleteProject,
    });
  };

  return (
    <>
      {ConfirmDialog}
      <Button
        variant="destructive"
        size="icon"
        onClick={handleDeleteClick}
        disabled={disabled}
        className="hover:scale-115"
      >
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </>
  );
}
