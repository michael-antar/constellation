"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Definition } from "@/types/types";
import { updateDefinitionSchema } from "@/lib/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export function EditDefinitionForm({ definition }: { definition: Definition }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize state with the definition's existing data
  const [formData, setFormData] = useState({
    term: definition.term,
    explanation: definition.explanation,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validation = updateDefinitionSchema.safeParse(formData);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error(firstError.message);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/definitions/edit/${definition.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update definition");
      }

      toast.success("Definition updated successfully!");
      router.push("/admin/definitions");
      router.refresh(); // Ensure the definitions list is fresh
    } catch (error) {
      console.error("Update definition failed:", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="term">Term</Label>
        <Input
          id="term"
          name="term"
          value={formData.term}
          onChange={handleChange}
          placeholder="e.g., API"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          name="explanation"
          value={formData.explanation}
          onChange={handleChange}
          placeholder="e.g., Application Programming Interface..."
          disabled={isSubmitting}
          rows={5}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/definitions">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
