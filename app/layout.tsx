import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Draidly résume vos emails, prépare vos réponses, crée vos tâches et retrouve vos informations — votre copilote IA pour PME.";

export const metadata: Metadata = {
  metadataBase: new URL("https://draidly.com"),
  title: {
    default: "Draidly — l'assistant IA pour PME",
    template: "%s · Draidly",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Draidly — l'assistant IA pour PME",
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
    siteName: "Draidly",
  },
  twitter: {
    card: "summary_large_image",
    title: "Draidly — l'assistant IA pour PME",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#6d5cf0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
