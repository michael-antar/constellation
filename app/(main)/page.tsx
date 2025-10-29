import { getPages } from "@/lib/data/pages";
import { Page } from "@/types/types";
import Link from "next/link";

export default async function HomePage() {
  const pages: Page[] = await getPages();

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Pages</h2>
        {pages.length > 0 ? (
          <ul className="space-y-2">
            {pages.map((page) => (
              <li key={page.id}>
                <Link
                  href={`/pages/${page.slug}`}
                  className="text-lg text-blue-600 hover:underline"
                >
                  {page.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {page.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pages found.</p>
        )}
      </div>
    </div>
  );
}
