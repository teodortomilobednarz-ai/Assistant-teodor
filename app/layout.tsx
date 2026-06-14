import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.AUTH_URL ?? "https://draidly.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Draidly",
  title: {
    default: "Draidly — l'assistant IA pour PME",
    template: "%s · Draidly",
  },
  description:
    "Draidly résume vos emails, prépare vos réponses, crée vos tâches et retrouve vos informations.",
  keywords: [
    "assistant IA",
    "copilote PME",
    "résumé email",
    "Gmail",
    "agenda",
    "productivité",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Draidly",
    title: "Draidly — l'assistant IA pour PME",
    description:
      "Connectez vos emails, agenda et documents. Draidly résume, rédige vos réponses, crée vos tâches et retrouve vos infos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Draidly — l'assistant IA pour PME",
    description:
      "Votre copilote IA branché à vos outils. Résume, rédige, organise, retrouve.",
  },
  robots: { index: true, follow: true },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
