import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Mentions légales — Draidly",
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Mentions légales
      </h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : 2026-06-16</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">Éditeur</h2>
          <p className="mt-2">
            Le service Draidly est édité par Teodor Tomilo Bednarz,
            entrepreneur individuel (micro-entreprise).
          </p>
          <p className="mt-2">
            SIRET : <strong>[à compléter après immatriculation]</strong>
            <br />
            Adresse : <strong>[à compléter]</strong>
            <br />
            Contact : <strong>contact@draidly.app</strong>
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Directeur de la publication
          </h2>
          <p className="mt-2">Teodor Tomilo Bednarz.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Hébergement</h2>
          <p className="mt-2">
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
            CA 91789, États-Unis — <span className="break-all">vercel.com</span>.
            La base de données est hébergée par Neon (neon.tech).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Propriété intellectuelle
          </h2>
          <p className="mt-2">
            La marque Draidly, le logo et l&apos;ensemble des contenus du site
            sont protégés. Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Données personnelles</h2>
          <p className="mt-2">
            Le traitement de vos données est décrit dans notre{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              politique de confidentialité
            </Link>
            . Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
            de rectification et de suppression de vos données, exerçable depuis
            les réglages de votre compte ou à contact@draidly.app.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs text-muted">
        Modèle à finaliser avec vos informations d&apos;immatriculation avant la
        mise en production publique.
      </p>
    </main>
  );
}
