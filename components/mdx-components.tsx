import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

import { AlertTriangle } from "lucide-react";

// --- Custom Component Declarations ---

const Warning = ({
  content,
  children,
  className,
  node, // Extracted to be removed
  ...props // Spread to the element for added flexibility
}: any) => {
  return (
    <span
      className={cn(
        "flex items-start gap-3 p-4 my-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200",
        className
      )}
      {...props}
    >
      <span className="shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5" />
      </span>
      <span className="text-sm leading-relaxed block">
        <strong className="font-bold">Warning: </strong>
        {content || children}
      </span>
    </span>
  );
};

export const mdxComponents = {
  // -- Custom MDX Components ---
  Warning,
  warning: Warning,

  // --- Headers ---
  h1: (props: React.ComponentProps<"h1">) => (
    <h1 className="text-5xl font-bold text-h1" {...props} />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2 className="text-4xl font-semibold text-h2 mt-8 mb-4" {...props} />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="text-3xl font-semibold text-h3 mt-6 mb-2" {...props} />
  ),
  h4: (props: React.ComponentProps<"h4">) => (
    <h3 className="text-2xl font-semibold text-h4 mt-6 mb-2" {...props} />
  ),
  h5: (props: React.ComponentProps<"h5">) => (
    <h3 className="text-xl font-semibold text-h5 mt-6 mb-2" {...props} />
  ),
  h6: (props: React.ComponentProps<"h6">) => (
    <h3 className="text-lg font-semibold text-h6 mt-6 mb-2" {...props} />
  ),
  // --- Basic Text ---
  p: (props: React.ComponentProps<"p">) => (
    <p className="my-4 text-base text-p leading-7" {...props} />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="font-bold text-bold" {...props} />
  ),
  em: (props: React.ComponentProps<"em">) => (
    <em className="italic text-italic" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="list-disc list-inside my-4 pl-4 text-p" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="list-decimal list-inside my-4 pl-4 text-p" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => <li className="my-2" {...props} />,
  hr: (props: React.ComponentProps<"hr">) => (
    <hr className="my-8 border-muted" {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote className="border-l-4 border-primary pl-4 italic" {...props} />
  ),

  // Links
  a: (props: React.ComponentProps<"a">) => {
    const href = props.href || "";
    // Internal Link
    if (href.startsWith("/")) {
      return (
        <Link
          href={href}
          className="font-medium bg-gradient-to-r
          from-galaxy-start to-galaxy-end bg-clip-text
          text-transparent hover:brightness-110"
          {...props}
        />
      );
    }
    // External Link
    return (
      <a
        href={href}
        className="text-secondary-foreground underline decoration-dotted"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },

  // --- Code Blocks and Inline Code ---
  pre: (props: React.ComponentProps<"pre">) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />
  ),
  code: ({ className, children, ...props }: React.ComponentProps<"code">) => {
    // Blocks usually come with a class like "language-js"
    const isBlock = /language-(\w+)/.test(className || "");

    if (isBlock) {
      return (
        <code className={cn("text-sm font-mono", className)} {...props}>
          {children}
        </code>
      );
    }

    // Default to inline styling if no language class is found
    return (
      <code
        className={cn(
          "bg-muted px-1.5 py-0.5 rounded text-sm font-mono",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
};
