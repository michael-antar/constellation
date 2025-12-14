"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mdxComponents } from "@/components/mdx-components";

// Editor and Preview Imports
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Styles for Math

import { Category } from "@/types/types";
import { cn } from "@/lib/utils";

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, ""); // Remove all non-word chars
};

type ViewMode = "edit" | "preview" | "split";

type CreatePageFormProps = {
  categories: Category[];
};

export function CreatePageForm({ categories }: CreatePageFormProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  // Handles opening dialog
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  const handleCreatePage = async () => {
    setIsLoading(true);

    const response = await fetch("/api/pages/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, description, content, categoryId }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Page created successfully!");
      router.push(`/pages/${data.slug}`); // Redirect to the newly created page
    } else {
      toast.error(data.message || "An error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-0">
          {/* Top Row: Title & Slug */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              value={categoryId ?? ""}
              onValueChange={(value) => {
                setCategoryId(value === "none" ? null : value);
              }}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Meta Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="A brief summary for search results..."
              className="resize-none h-20"
            />
          </div>

          {/* --- Editor Section --- */}
          <div className="grid gap-2">
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
                  value={content}
                  height="500px"
                  extensions={[
                    markdown({
                      base: markdownLanguage,
                      codeLanguages: languages,
                    }),
                  ]}
                  onChange={(value) => setContent(value)}
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
                {content ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={mdxComponents}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic">
                    Start typing to see the preview...
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Supports Markdown, LaTeX math ($...$), and code blocks.
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-6 px-0">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "Creating..." : "Create Page"}
          </Button>
        </CardFooter>
      </form>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will create a new page with the slug{" "}
              <code className="font-mono text-sm bg-muted p-1 rounded-sm">
                {slug}
              </code>
              . You can edit the page later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreatePage}>
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
