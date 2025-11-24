import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: '--font-dancing-script' });

export const metadata: Metadata = {
  title: "CrispPDF - Professional PDF Editor",
  description: "Edit, annotate, and sign PDFs with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dancingScript.variable}`}>{children}</body>
    </html>
  );
}
