import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // Add import for Badge
import type { Project } from "@/types/projects";

type SelectProjectProps = {
  availableProjects: Project[];
  selectedProjectId: string | null;
  handleProjectChange: (projectId: string) => void;
  proposedCounts?: Record<string, number>;
};

export default function SelectProject({
  availableProjects,
  selectedProjectId,
  handleProjectChange,
  proposedCounts,
}: SelectProjectProps) {
  return (
    <Select value={selectedProjectId ?? ""} onValueChange={handleProjectChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {availableProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
            {(proposedCounts?.[project.id] ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-2">
                {proposedCounts?.[project.id] ?? 0}
              </Badge>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
