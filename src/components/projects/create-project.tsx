import {
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

type CreateProjectProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  handleCreateProject: (name: string, description: string) => Promise<boolean>;
  disabled?: boolean;
};

export default function CreateProject({
  open,
  onOpenChange,
  handleCreateProject,
  disabled = false,
}: CreateProjectProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const resetForm = () => {
    setNewProjectName("");
    setNewProjectDescription("");
  };

  const handleSubmit = async () => {
    const success = await handleCreateProject(
      newProjectName,
      newProjectDescription
    );
    if (success) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="hover:scale-115"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 items-center gap-4">
            <Label htmlFor="project-name" className="text-right">
              Project Name:
            </Label>
            <Input
              id="project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="col-span-3"
              placeholder="Enter project name"
            />
          </div>
          <div className="grid grid-cols-1 items-center gap-4">
            <Label htmlFor="project-description" className="text-right">
              Project Description:
            </Label>
            <Input
              id="project-description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter project description"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!newProjectName.trim() || !newProjectDescription.trim()}
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
