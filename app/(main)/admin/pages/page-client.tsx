"use client";

import { useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/admin/data-table";
import { Page } from "@/types/types";
import { toast } from "sonner";

type PageClientProps = {
  data: Page[];
};

export function PageClient({ data }: PageClientProps) {
  const router = useRouter();

  if (!data) {
    return <div className="text-red-500">Error: Could not load pages.</div>;
  }

  const pageColumns: ColumnDef<Page>[] = [
    { header: "Title", accessorKey: "title" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Last Updated",
      accessorKey: "updated_at",
      cell: (item) => new Date(item.updated_at).toLocaleDateString(),
    },
  ];

  const handleEdit = (id: string) => {
    router.push(`/admin/pages/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    // TODO: Update to use alert dialog instead of base confirm
    if (!confirm("Are you sure you want to delete this page?")) {
      return; // User canceled
    }

    try {
      const response = await fetch(`/api/pages/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Page deleted successfully!");
        router.refresh(); // Refresh server data without deleted page
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete page.");
      }
    } catch (error) {
      // Handle network errors or other unexpected errors
      console.error("Delete failed:", error);
      toast.error(
        "An error occurred. Please check your connection and try again."
      );
    }
  };

  return (
    <DataTable
      data={data}
      columns={pageColumns}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
