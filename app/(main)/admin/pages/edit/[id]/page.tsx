import { getPageById } from "@/lib/data/pages";
import { getCategories } from "@/lib/data/categories";
import { notFound } from "next/navigation";
import { EditPageForm } from "./edit-page-form";

type EditPageProps = {
  params: {
    id: string;
  };
};

// This is an async Server Component
export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;

  const [page, categories] = await Promise.all([
    getPageById(id),
    getCategories(),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Page</h1>

      <EditPageForm page={page} categories={categories} />
    </div>
  );
}
