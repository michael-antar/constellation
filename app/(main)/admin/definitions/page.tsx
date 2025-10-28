import { getDefinitions } from "@/lib/data/definitions";
import { DefinitionClient } from "./definition-client";

export default async function ManageDefinitionsPage() {
  const definitions = await getDefinitions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Definitions</h1>
      </div>

      <DefinitionClient data={definitions} />
    </div>
  );
}
