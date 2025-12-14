import { CreatePageForm } from "./create-page-form";
import { getCategories } from "@/lib/data/categories";

export default async function CreatePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h2 className="text-2xl font-bold mb-6">Create Page</h2>
      <CreatePageForm categories={categories} />
    </div>
  );
}
