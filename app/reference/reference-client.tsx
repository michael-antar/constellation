"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// UI Components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// Editor & Preview Imports
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { mdxComponents } from "@/components/mdx-components";

type ViewMode = "edit" | "preview" | "split";

const EXAMPLE_CONTENT = `# Heading Level 1
## Heading Level 2
### Heading Level 3

This is a standard paragraph with **bold text**, *italic text*, and \`inline code\`.

---

### Lists
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Second item

### Code Blocks
\`\`\`javascript
function helloWorld() {
  console.log("Hello, Constellation!");
}
\`\`\`

### Math (LaTeX)
Inline math: $E = mc^2$

Block math:
$$
\\int_{0}^{\\infty} x^2 dx
$$

### Blockquotes
> This is a blockquote.
> It can span multiple lines.

### Links
- [Internal Link](/pages/algorithms)
- [External Link](https://nextjs.org)
`;

export default function ReferenceClient() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [content, setContent] = useState(EXAMPLE_CONTENT);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="text-2xl font-bold mb-6">MDX Reference Guide</h2>
        <p className="mb-4 text-muted-foreground">
          Use this guide to see how Markdown syntax renders in the application.
        </p>

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

          <div className="border rounded-md min-h-[600px] flex overflow-hidden bg-background shadow-sm">
            {/* Code Editor */}
            <div
              className={cn(
                "flex-1 border-r overflow-auto transition-all",
                viewMode === "preview" ? "hidden" : "block",
                viewMode === "split" ? "w-1/2" : "w-full"
              )}
            >
              {mounted ? (
                <CodeMirror
                  value={content}
                  height="600px"
                  extensions={[
                    markdown({
                      base: markdownLanguage,
                      codeLanguages: languages,
                    }),
                    EditorView.lineWrapping,
                  ]}
                  onChange={(value) => setContent(value)}
                  className="text-base"
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                />
              ) : (
                <div className="h-[500px] bg-muted/10 animate-pulse" />
              )}
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
        </div>
      </div>
    </div>
  );
}
