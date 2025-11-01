import {
  getPageBySlug,
  getOutgoingLinks,
  getIncomingLinks,
} from "@/lib/data/pages";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import React from "react";
import { PageLink } from "@/types/types";

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

  // Fetch links in parallel
  const [outgoingLinks, incomingLinks] = await Promise.all([
    getOutgoingLinks(page.id),
    getIncomingLinks(page.id),
  ]);

  return (
    <article className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      <p className="text-lg text-muted-foreground">{page.description}</p>

      <hr className="my-8" />

      {/* Main Page Content */}
      <MDXRemote source={page.content} components={components} />

      {/* Section for Incoming/Outgoing Links */}
      <hr className="my-12 border-dashed" />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
        <PageLinkList title="Links To" links={outgoingLinks} />
        <PageLinkList title="Linked From" links={incomingLinks} />
      </section>
    </article>
  );
}

// Helper component to render a page-link list
function PageLinkList({ title, links }: { title: string; links: PageLink[] }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-h2 dark:text-h2-dark mb-4">
        {title}
      </h2>
      {links.length > 0 ? (
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.slug}>
              <Link
                href={`/pages/${link.slug}`}
                className="
                  font-medium bg-gradient-to-r
                  from-galaxy-start to-galaxy-end bg-clip-text
                  text-transparent hover:brightness-110
                "
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="italic text-muted-foreground">None</p>
      )}
    </div>
  );
}
