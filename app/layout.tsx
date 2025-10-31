import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

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
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
