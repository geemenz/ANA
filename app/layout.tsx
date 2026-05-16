import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design Customization MVP",
  description: "Linktree-style design editor MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
