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
import { KanbanAvatar } from "@/components/ui/user-avatar";
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
            <TableHead className="text-xs md:text-sm">Name</TableHead>
            <TableHead className="text-xs md:text-sm">Status</TableHead>
            <TableHead className="text-xs md:text-sm">Owner</TableHead>
            <TableHead className="text-xs md:text-sm hidden md:table-cell">
              Description
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: KanbanItemProps) => {
            const column = getColumnDetails(item.column ?? "");
            return (
              <TableRow
                key={item.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  item.isProposed ? "opacity-50" : ""
                )}
                onClick={() => onSelect(item)}
              >
                <TableCell className="font-medium max-w-20 md:max-w-25 truncate text-xs md:text-sm">
                  {item.name}
                </TableCell>
                <TableCell className="max-w-3 md:max-w-5 truncate">
                  <ListViewStatusBadge
                    status={column.name}
                    color={column.color}
                  />
                </TableCell>
                <TableCell className="max-w-10 md:max-w-15 truncate">
                  <KanbanAvatar owner={item.owner} />
                </TableCell>
                <TableCell className="max-w-20 md:max-w-35 hidden md:table-cell">
                  <div className="text-xs md:text-sm truncate max-w-[200px] md:max-w-[300px]">
                    {item.description}
                  </div>
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
