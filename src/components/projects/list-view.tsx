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
  const getColumnDetails = (columnId: string) => {
    return (
      columns.find((col) => col.id === columnId) || {
        name: columnId,
        color: undefined,
      }
    );
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
          {items.map((item: KanbanItemProps) => {
            const column = getColumnDetails(item.column ?? "");
            return (
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
                    status={column.name}
                    color={column.color}
                  />
                </TableCell>
                <TableCell className="max-w-15 truncate">
                  <ListViewAvatar owner={item.owner} />
                </TableCell>
                <TableCell className="max-w-35 truncate">
                  <div className="text-sm w-20">{item.description}</div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
