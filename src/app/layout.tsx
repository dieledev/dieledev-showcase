import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dieledev showcase",
  description:
    "A collection of development projects and experiments by dieledev.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
