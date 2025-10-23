import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getPages } from "@/lib/data/pages";
import { PageClient } from "./page-client";

export default async function ManagePagesPage() {
  const pages = await getPages();

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

      <PageClient data={pages} />
    </div>
  );
}
