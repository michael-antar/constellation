import { getCategories } from "@/lib/data/categories";
import { CategoryClient } from "./category-client";

export default async function ManageCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
      </div>

      <CategoryClient data={categories} />
    </div>
  );
}
