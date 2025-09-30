import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { KanbanItemProps } from "@/components/projects/index";
import type { Column } from "@/types/projects";
import { ListViewAvatar } from "@/components/ui/user-avatar";
import { ListViewStatusBadge } from "@/utils/statusBadge";

type ListViewProps = {
  items: KanbanItemProps[];
  className?: string;
  columns?: Column[];
  onSelect: React.Dispatch<React.SetStateAction<KanbanItemProps | null>>;
};

export function ListView({
  items,
  className,
  columns = [],
  onSelect,
}: ListViewProps) {
  const getColumnName = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    return column?.name || columnId;
  };

  return (
    <ScrollArea className={cn("overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: KanbanItemProps) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelect(item)}
            >
              <TableCell className="font-medium max-w-25 truncate">
                {item.name}
              </TableCell>
              <TableCell className="max-w-5 truncate">
                <ListViewStatusBadge
                  status={getColumnName(item.column ?? "")}
                />
              </TableCell>
              <TableCell className="max-w-15 truncate">
                <ListViewAvatar owner={item.owner} />
              </TableCell>
              <TableCell className="max-w-35 truncate">
                <div className="text-sm w-20">{item.description}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
