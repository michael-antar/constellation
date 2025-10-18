import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreatePageForm } from "@/components/create-page-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function CreatePage() {
  // Redirect non-admins to the homepage
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
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
