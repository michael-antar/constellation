import { getPageBySlug } from "@/lib/data/pages";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import React from "react";

const components = {
  h1: (props: React.ComponentProps<"h1">) => (
    <h1 className="text-3xl font-bold text-blue-600" {...props} />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      className="text-2xl font-semibold text-purple-600 mt-8 mb-4"
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="my-4 text-base leading-7" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="list-disc list-inside my-4 pl-4" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => <li className="my-2" {...props} />,
  a: (props: React.ComponentProps<"a">) => {
    const href = props.href || "";
    if (href.startsWith("/")) {
      return (
        <Link
          href={href}
          className="text-teal-500 hover:underline"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        className="text-teal-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
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

  return (
    <article className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      <p className="text-lg text-muted-foreground">{page.description}</p>

      <hr className="my-8" />

      <MDXRemote source={page.content} components={components} />
    </article>
  );
}
