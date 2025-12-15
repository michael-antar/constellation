"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { toast } from "sonner";

// Data and Types
import { Page, Category } from "@/types/types";
import { updatePageSchema } from "@/lib/zod";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Editor and Preview Imports
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Styles for Math
import { mdxComponents } from "@/components/mdx-components";

type ViewMode = "edit" | "preview" | "split";

type EditPageFormProps = {
  page: Page;
  categories: Category[];
};

export function EditPageForm({ page, categories }: EditPageFormProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("split");

  // Track form state for submission
  const [formData, setFormData] = useState({
    title: page.title,
    description: page.description,
    content: page.content || "",
    categoryId: page.category_id || null,
  });

  // Generic handler for standard inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validation = updatePageSchema.safeParse(formData);

      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error(firstError.message);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/pages/edit/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update page");
      }

      toast.success("Page updated successfully!");
      router.push("/admin/pages"); // Send user back to the list
      router.refresh(); // Ensure the list page re-fetches data
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-0">
      {/* Top Section: Metadata */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Page Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Page Title"
            disabled={isSubmitting}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.categoryId || "none"}
            onValueChange={handleCategoryChange}
            disabled={isSubmitting}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">Meta Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="A brief summary for search results..."
          className="resize-none h-20"
        />
      </div>

      {/* --- Editor Section --- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content (MDX)</Label>
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="split">Split</TabsTrigger>
              <TabsTrigger value="preview">View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="border rounded-md min-h-[500px] flex overflow-hidden bg-background">
          {/* Code Editor */}
          <div
            className={cn(
              "flex-1 border-r overflow-auto transition-all",
              viewMode === "preview" ? "hidden" : "block",
              viewMode === "split" ? "w-1/2" : "w-full"
            )}
          >
            <CodeMirror
              value={formData.content}
              height="500px"
              extensions={[
                markdown({
                  base: markdownLanguage,
                  codeLanguages: languages,
                }),
                EditorView.lineWrapping,
              ]}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, content: value }))
              }
              className="text-base"
              theme={resolvedTheme === "dark" ? "dark" : "light"}
            />
          </div>

          {/* Live Preview */}
          <div
            className={cn(
              "flex-1 bg-background p-6 overflow-auto transition-all",
              viewMode === "edit" ? "hidden" : "block",
              viewMode === "split" ? "w-1/2" : "w-full"
            )}
            style={{ height: "500px" }}
          >
            {formData.content ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={mdxComponents}
                >
                  {formData.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Start typing to see the preview...
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Supports Markdown, LaTeX math ($...$), and code blocks.{" "}
          <a
            href="/admin/pages/reference"
            target="_blank"
            className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2"
          >
            (View Syntax Guide)
          </a>
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild>
          <Link href="/admin/pages">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
