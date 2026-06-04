import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteFlow API",
  description: "Backend independiente para NoteFlow Dev con Next.js y Neon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
