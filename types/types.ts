/*
The central table of the application, holding the content for each topic. Used to store the main content, title, and metadata for every page in the knowledge base.
*/
export type Page = {
  id: string; // Unique identifier for the page: UUID PRIMARY KEY DEFAULT'gen_random_uuid()'
  title: string; // Human-readable title of the page: TEXT NOT NULL
  slug: string; // URL-friendly version of the title (e.g., "singly-linked-lists"): TEXT UNIQUE NOT NUL
  description: string; // SEO description of page: TEXT NOT NULL
  content: string | null; // Full MDX content for page: TEXT
  created_at: string; // When the page was first created: TIMESTAMPTZ NOT NULL DEFAULT 'now()'
  updated_at: string; // When the page was last updated: TIMESTAMPTZ NOT NULL DEFAULT 'now()'
  author_id: string; // The user responsible for the page: UUID FOREiGN KEY REFERENCES users.id ON DELETE SET NULL
  category_id: string; // The category the page belongs to: UUID FOREIGN KEY REFERENCES categories.id ON DELETE RESTRICT
};

/* 
Defines different categories a page can belong to. Used to classify pages for coloring nodes in the constellation and for filtering
*/
export type Category = {
  id: string; // Unique identifier for category: UUID PRIMARY KEY DEFAULT'gen_random_uuid()'
  name: string; // Display name for category: TEXT UNIQUE NOT NULL
  color_hex: string | null; // Hex string for its color in the constellation: TEXT
};

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
