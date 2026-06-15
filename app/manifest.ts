import type { MetadataRoute } from "next";

/** PWA manifest — lets users install Draidly to their home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Draidly — l'assistant IA pour PME",
    short_name: "Draidly",
    description:
      "Draidly résume vos emails, prépare vos réponses, crée vos tâches et retrouve vos informations.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f8fc",
    theme_color: "#6d5cf0",
    lang: "fr",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" },
    ],
  };
}
