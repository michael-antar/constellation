import { CreatePageForm } from "@/components/admin/create-page-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function CreatePage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Page</CardTitle>
          <CardDescription>
            Fill out the form below to add a new page to the knowledge base.
          </CardDescription>
        </CardHeader>
        <CreatePageForm />
      </Card>
    </div>
  );
}
