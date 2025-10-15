import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Constellation",
  description: "Interactive knowledge graph of computer science concepts.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="container p-4">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
