import { getDefinitionById } from "@/lib/data/definitions";
import { notFound } from "next/navigation";
import { EditDefinitionForm } from "./edit-definition-form";

type EditDefinitionPageProps = {
  params: {
    id: string;
  };
};

export default async function EditDefinitionPage({
  params,
}: EditDefinitionPageProps) {
  const id = params.id;

  const definition = await getDefinitionById(id);

  if (!definition) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Definition</h1>

      <EditDefinitionForm definition={definition} />
    </div>
  );
}
