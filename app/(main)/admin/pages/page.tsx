"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/admin/data-table";
import { PlusCircle } from "lucide-react";
import { Page } from "@/types/types";

export default function ManagePagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/pages");
        if (!response.ok) {
          throw new Error("Failed to fetch pages");
        }
        const data = await response.json();
        setPages(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

  if (isLoading) {
    return <div>Loading pages...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
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

  // TODO
  const handleEdit = (id: string) => {
    console.log("Edit page:", id);
    // Navigate to /admin/pages/edit/[id]
  };

  // TODO
  const handleDelete = (id: string) => {
    console.log("Delete page:", id);
    // Open confirmation dialog and call API
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Pages</h1>
        <Button asChild>
          <Link href="/admin/pages/create">
            <PlusCircle className="h-4 w-4" />
            Create New Page
          </Link>
        </Button>
      </div>
      <DataTable
        data={pages}
        columns={pageColumns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
