import { Badge } from "@/components/ui/badge";

type ListViewStatusBadgeProps = {
  status: string;
  color?: string;
};

export function ListViewStatusBadge({
  status,
  color,
}: ListViewStatusBadgeProps) {
  return (
    <Badge
      className={`text-xs ${color ? `bg-[${color}] text-white` : "bg-muted"}`}
      style={{ backgroundColor: color || undefined }}
    >
      {status}
    </Badge>
  );
}
