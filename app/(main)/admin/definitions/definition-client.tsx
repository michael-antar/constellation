"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, ColumnDef } from "@/components/admin/data-table";
import { Definition } from "@/types/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateDefinitionForm } from "./create-definition-form";

type DefinitionClientProps = {
  data: Definition[];
};

export function DefinitionClient({ data }: DefinitionClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define the columns for the Definition data
  const definitionColumns: ColumnDef<Definition>[] = [
    { header: "Term", accessorKey: "term" },
    {
      header: "Explanation",
      accessorKey: "explanation",
      // Truncate long explanations for the table view
      cell: (item) => <p className="truncate max-w-sm">{item.explanation}</p>,
    },
  ];

  const handleEdit = (id: string) => {
    router.push(`/admin/definitions/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this definition?")) {
      return;
    }

    try {
      const response = await fetch(`/api/definitions/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Definition deleted successfully!");
        router.refresh(); // Refresh server data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete definition.");
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
        <div className="flex justify-end mb-4">
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Definition
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Definition</DialogTitle>
          </DialogHeader>

          <CreateDefinitionForm
            onSuccess={() => {
              setIsDialogOpen(false); // Close dialog
              router.refresh(); // Refresh the table data
            }}
          />
        </DialogContent>
      </Dialog>

      <DataTable
        data={data}
        columns={definitionColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
