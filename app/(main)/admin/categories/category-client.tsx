"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, ColumnDef } from "@/components/admin/data-table";
import { Category } from "@/types/types";

type CategoryClientProps = {
  data: Category[];
};

export function CategoryClient({ data }: CategoryClientProps) {
  const router = useRouter();

  const categoryColumns: ColumnDef<Category>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Color",
      accessorKey: "color_hex",
      // Custom cell renderer to show a color swatch
      cell: (item) => (
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full border"
            style={{ backgroundColor: item.color_hex || "#FFFFFF" }}
          />
          <span>{item.color_hex}</span>
        </div>
      ),
    },
  ];

  const handleEdit = (id: string) => {
    router.push(`/admin/categories/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully!");
        router.refresh(); // Refresh server data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete category.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(
        "An error occurred. Please check your connection and try again."
      );
    }
  };

  return (
    <DataTable
      data={data}
      columns={categoryColumns}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
