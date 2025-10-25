"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, ColumnDef } from "@/components/admin/data-table";
import { Category } from "@/types/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateCategoryForm } from "./create-category-form";

type CategoryClientProps = {
  data: Category[];
};

export function CategoryClient({ data }: CategoryClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Category</DialogTitle>
            </DialogHeader>
            <CreateCategoryForm
              onSuccess={() => {
                setIsDialogOpen(false); // Close dialog
                router.refresh(); // Refresh the table data
              }}
            />
          </DialogContent>
        </>
      </Dialog>
      <DataTable
        data={data}
        columns={categoryColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
