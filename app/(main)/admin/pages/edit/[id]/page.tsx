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
    <div className="mx-auto w-full max-w-7xl">
      <h2 className="text-2xl font-bold mb-6">Edit Page</h2>
      <EditPageForm page={page} categories={categories} />
    </div>
  );
}
