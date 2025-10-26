import { getCategoryById } from "@/lib/data/categories";
import { notFound } from "next/navigation";
import { EditCategoryForm } from "./edit-category-form";

type EditCategoryPageProps = {
  params: {
    id: string;
  };
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Category</h1>

      <EditCategoryForm category={category} />
    </div>
  );
}
