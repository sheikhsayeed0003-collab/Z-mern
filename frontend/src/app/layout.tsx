import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IoT programmers — Daraz-style Shopping",
  description: "Multi-functional e-commerce with user and admin dashboards",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-amer-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
