import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

// Custom components
import { Spoiler } from "@/components/mdx/spoiler";
import { Tabs, Tab } from "@/components/mdx/tabs";
import { Alert, Info, Warning, Issue } from "@/components/mdx/alert";

export const mdxComponents = {
  // --- Custom MDX Components ---

  Spoiler,
  spoiler: Spoiler,

  Tabs,
  tabs: Tabs,
  Tab,
  tab: Tab,

  // Alerts (and variants as their own)
  Alert,
  alert: Alert,
  Info,
  info: Info,
  Warning,
  warning: Warning,
  Issue,
  issue: Issue,

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
  // Returns a div instead of p if its children include a block-level component (fixes hydration errors)
  p: ({ children, ...props }: React.ComponentProps<"p">) => {
    // Check if children contains a block-level component (like Tabs)
    const hasBlockChild = React.Children.toArray(children).some(
      (child) =>
        React.isValidElement(child) &&
        // Check for specific block components or generic divs
        (child.type === Tabs ||
          child.type === "div" ||
          child.type === "section")
    );

    // If it contains a block, render a div instead of p
    if (hasBlockChild) {
      return <div {...props}>{children}</div>;
    }

    return (
      <p className="my-4 text-base text-p leading-7" {...props}>
        {children}
      </p>
    );
  },
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
