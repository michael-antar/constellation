export type Category = {
  id: string;
  name: string;
  color_hex: string | null;
};

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
