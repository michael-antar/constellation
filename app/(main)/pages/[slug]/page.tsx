import { getPageBySlug } from "@/lib/data/pages";
import { getPageNeighborhood } from "@/lib/data/graph";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import React from "react";
import { GraphClient } from "@/components/graph/graph-client";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const components = {
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
  // --- Link Styles ---
  a: (props: React.ComponentProps<"a">) => {
    const href = props.href || "";
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
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="list-disc list-inside my-4 pl-4" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => <li className="my-2" {...props} />,
};

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function PageBySlug({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.content) {
    notFound();
  }

  // Fetch data for mini graph
  const { nodes, edges } = await getPageNeighborhood(slug);

  return (
    <article className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      <p className="text-lg text-muted-foreground">{page.description}</p>

      <hr className="my-8" />

      {/* Main Page Content */}
      <MDXRemote
        source={page.content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          },
        }}
      />

      {/* Mini Graph */}
      <hr className="my-12 border-dashed" />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-h2 mb-4">Connections</h2>

        {nodes.length > 1 ? (
          <div className="h-[500px] border rounded-lg bg-background overflow-hidden relative">
            <GraphClient
              nodes={nodes}
              edges={edges}
              enableSearch={false} // Turn off search for mini-graph
              className="bg-slate-50 dark:bg-slate-900/50"
            />

            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
              {nodes.length - 1} connected pages
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            This page has no connections yet.
          </p>
        )}
      </section>
    </article>
  );
}
