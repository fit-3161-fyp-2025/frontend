import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Project = {
  id: string;
  name: string;
  description?: string | null;
};

type SelectProjectProps = {
  availableProjects: Project[];
  selectedProjectId?: string | null;
  handleProjectChange: (value: string) => void;
};

export default function SelectProject({
  availableProjects,
  selectedProjectId,
  handleProjectChange,
}: SelectProjectProps) {
  return (
    <Select value={selectedProjectId || ""} onValueChange={handleProjectChange}>
      <SelectTrigger className="flex-start w-[255px] py-6.5">
        <SelectValue className="text-left truncate" />
      </SelectTrigger>
      <SelectContent className="text-left">
        {availableProjects.map((proj) => (
          <SelectItem key={proj.id} value={proj.id}>
            <div className="grid grid-rows-2">
              <div className="text-left font-medium">{proj.name}</div>
              {proj.description && (
                <div className="text-left text-xs">{proj.description}</div>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
