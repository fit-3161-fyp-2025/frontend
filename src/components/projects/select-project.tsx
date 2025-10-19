import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <Select
        value={selectedProjectId ?? ""}
        onValueChange={handleProjectChange}
      >
        <SelectTrigger className="w-[180px] sm:w-[240px] md:w-[280px] hover:bg-accent">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {availableProjects.map((project) => (
            <SelectItem
              key={project.id}
              value={project.id}
              className="flex justify-between items-center"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate max-w-[280px]">{project.name}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{project.description}</p>
                </TooltipContent>
              </Tooltip>
              {(proposedCounts?.[project.id] ?? 0) > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {proposedCounts?.[project.id] ?? 0}
                </Badge>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </TooltipProvider>
  );
}
