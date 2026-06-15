import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Conditions d'utilisation — Draidly",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Conditions d&apos;utilisation
      </h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : 2026-06-15</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">Service</h2>
          <p className="mt-2">
            Draidly est un assistant IA qui se connecte à vos outils Google pour
            résumer, préparer des réponses, organiser et retrouver vos
            informations. Le service est fourni « en l&apos;état ».
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Votre responsabilité
          </h2>
          <p className="mt-2">
            Vous gardez le contrôle : Draidly prépare et propose, mais
            n&apos;envoie aucun email et n&apos;effectue aucune action externe
            sans votre validation explicite. Vous êtes responsable du contenu que
            vous validez et envoyez.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">IA</h2>
          <p className="mt-2">
            Les résultats sont générés par un modèle d&apos;IA et peuvent
            contenir des erreurs. Vérifiez toujours les informations importantes
            (montants, dates, engagements) avant de les utiliser.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Résiliation</h2>
          <p className="mt-2">
            Vous pouvez cesser d&apos;utiliser Draidly et révoquer son accès à
            tout moment depuis votre compte Google.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs text-muted">
        Ce document est un modèle de départ et doit être revu avant une mise en
        production publique.
      </p>
    </main>
  );
}
