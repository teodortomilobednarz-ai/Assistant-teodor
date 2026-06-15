import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Confidentialité — Draidly",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : 2026-06-15</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            Données collectées
          </h2>
          <p className="mt-2">
            Lors de la connexion avec Google, Draidly accède à votre nom, votre
            adresse email et votre photo de profil. Avec votre autorisation,
            Draidly accède également à votre messagerie Gmail (lecture, création
            de brouillons et envoi de réponses uniquement lorsque vous cliquez
            explicitement sur « Envoyer »), à votre Google Agenda (lecture et
            création d&apos;événements) et à votre Google Drive (lecture seule).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Utilisation</h2>
          <p className="mt-2">
            Ces données servent uniquement à vous rendre le service : résumer vos
            emails, préparer des réponses, créer des tâches, retrouver des
            informations et générer des documents. Les contenus que vous analysez
            sont traités par le modèle d&apos;IA Google Gemini pour produire ces
            résultats. Draidly ne vend pas vos données et ne les utilise pas à des
            fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Stockage</h2>
          <p className="mt-2">
            Draidly conserve votre compte, vos tâches, vos analyses et les
            documents que vous générez, afin de vous les présenter. Vos jetons
            d&apos;accès Google sont stockés de façon sécurisée pour appeler les
            API en votre nom. Aucun email n&apos;est envoyé et aucune action
            externe n&apos;est effectuée sans votre clic explicite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Vos droits
          </h2>
          <p className="mt-2">
            Vous pouvez révoquer l&apos;accès de Draidly à tout moment depuis les
            réglages de sécurité de votre compte Google. Pour toute demande de
            suppression de vos données, contactez-nous.
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
