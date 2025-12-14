import { getPageBySlug } from "@/lib/data/pages";
import { getPageNeighborhood } from "@/lib/data/graph";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import { GraphClient } from "@/components/graph/graph-client";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { mdxComponents } from "@/components/mdx-components";

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
        components={mdxComponents}
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
