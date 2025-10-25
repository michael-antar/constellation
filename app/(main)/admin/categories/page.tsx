// NO "use client". This is a Server Component.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { getCategories } from "@/lib/data/categories";
import { CategoryClient } from "./category-client";

export default async function ManageCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Button asChild>
          <Link href="/admin/categories/create">
            <PlusCircle className="h-4 w-4" />
            Create New Category
          </Link>
        </Button>
      </div>

      <CategoryClient data={categories} />
    </div>
  );
}
