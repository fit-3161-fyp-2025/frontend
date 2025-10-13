import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type ViewToggleProps = {
  view: "kanban" | "list";
  onViewChange: (view: "kanban" | "list") => void;
};

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 md:space-x-2 m-1 md:m-2">
      <Label htmlFor="view-switch" className="text-xs md:text-sm font-medium">
        Kanban
      </Label>
      <Switch
        id="view-switch"
        checked={view === "list"}
        onCheckedChange={(checked) => onViewChange(checked ? "list" : "kanban")}
        className="scale-75 md:scale-100"
      />
      <Label htmlFor="view-switch" className="text-xs md:text-sm font-medium">
        List
      </Label>
    </div>
  );
}
