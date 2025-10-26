"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/types/types";
import { updateCategorySchema } from "@/lib/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function EditCategoryForm({ category }: { category: Category }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize state with the category's existing data
  const [formData, setFormData] = useState({
    name: category.name,
    color_hex: category.color_hex || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const validation = updateCategorySchema.safeParse(formData);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error(firstError.message);
        setIsSubmitting(false);
        return;
      }

      // Call the PUT API endpoint
      const response = await fetch(`/api/categories/edit/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update category");
      }

      // Success: Show toast and redirect
      toast.success("Category updated successfully!");
      router.push("/admin/categories");
      router.refresh(); // Ensure the categories list is fresh
    } catch (error) {
      console.error("Update category failed:", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Data Structures"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color_hex">Hex Color</Label>
        <div className="flex items-center gap-2">
          {/* 6. Color swatch, just like in the create form */}
          <span
            className="h-10 w-10 rounded-md border border-input"
            style={{
              backgroundColor: formData.color_hex || "transparent",
            }}
          />
          <Input
            id="color_hex"
            name="color_hex"
            value={formData.color_hex}
            onChange={handleChange}
            placeholder="#A4B3C1"
            disabled={isSubmitting}
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/admin/categories">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
