import { CreatePageForm } from "./create-page-form";
import { getCategories } from "@/lib/data/categories";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function CreatePage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Page</CardTitle>
          <CardDescription>
            Fill out the form below to add a new page to the knowledge base.
          </CardDescription>
        </CardHeader>
        <CreatePageForm categories={categories} />
      </Card>
    </div>
  );
}
