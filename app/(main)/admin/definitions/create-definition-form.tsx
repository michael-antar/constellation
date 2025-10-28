"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createDefinitionSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CreateDefinitionFormProps = {
  onSuccess: () => void;
};

export function CreateDefinitionForm({ onSuccess }: CreateDefinitionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    term: "",
    explanation: "",
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
      // Validate the data
      const validation = createDefinitionSchema.safeParse(formData);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error(firstError.message);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/definitions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create definition");
      }

      // Success
      toast.success("Definition created successfully!");
      onSuccess(); // Closes the dialog and refreshes the table
    } catch (error) {
      console.error("Create definition failed:", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Definition"}
        </Button>
      </div>
    </form>
  );
}
