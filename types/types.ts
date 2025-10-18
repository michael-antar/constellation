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
