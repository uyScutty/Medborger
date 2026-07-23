import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";
import { LanguageProvider } from "@/lib/language/context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Medborger — Bestå indfødsretsprøven",
    template: "%s | Medborger",
  },
  description:
    "Forbered dig til den danske indfødsretsprøve med øvelsesopgaver, tidligere prøver og detaljerede forklaringer.",
  keywords: ["indfødsretsprøven", "dansk statsborgerskab", "prøve", "forberedelse", "øvelse"],
  openGraph: {
    siteName: "Medborger",
    type: "website",
    locale: "da_DK",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className={inter.className}>
        <LanguageProvider>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
