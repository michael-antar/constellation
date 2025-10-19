import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export type ColumnDef<T> = {
  header: string;
  accessorKey: keyof T; // The key in the data object
  cell?: (item: T) => React.ReactNode; // Optional custom cell renderer if formatting or enriching is needed
};

type DataTableProps<T extends { id: string }> = {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

/*
Generic component to display, edit, and delete items within table
*/
export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={String(col.accessorKey)}>{col.header}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((col) => (
                  <TableCell key={String(col.accessorKey)}>
                    {/* Use a custom cell renderer if provided, otherwise use the accessorKey */}
                    {col.cell ? col.cell(item) : String(item[col.accessorKey])}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(item.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
