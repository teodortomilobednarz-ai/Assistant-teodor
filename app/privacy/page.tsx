import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Confidentialité — Draidly",
};

const CONTACT = "contact@draidly.com";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Link href="/" className="inline-block">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : 2026-06-16</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">
            Données collectées
          </h2>
          <p className="mt-2">
            Lors de la connexion avec Google, Draidly accède à votre nom, votre
            adresse email et votre photo de profil. Avec votre autorisation
            explicite, Draidly accède également à :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Gmail</strong> — lecture de vos messages, gestion des
              libellés (lu/non lu, archivage), création de brouillons et envoi
              de réponses, uniquement lorsque vous cliquez sur « Envoyer ».
            </li>
            <li>
              <strong>Google Agenda</strong> — lecture de vos événements et
              création d&apos;événements à votre demande.
            </li>
            <li>
              <strong>Google Drive</strong> — lecture seule des fichiers que
              vous choisissez d&apos;analyser.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Utilisation</h2>
          <p className="mt-2">
            Ces données servent uniquement à vous rendre le service que vous
            demandez : résumer vos emails et documents, préparer des réponses,
            créer des tâches, retrouver des informations et générer des devis ou
            factures. Aucune donnée n&apos;est utilisée à des fins publicitaires
            et nous ne vendons jamais vos données.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Traitement par l&apos;IA
          </h2>
          <p className="mt-2">
            Les contenus que vous choisissez d&apos;analyser (texte d&apos;email,
            document) sont transmis au modèle d&apos;IA Google Gemini afin de
            produire le résumé, le brouillon ou la réponse. Ils ne sont
            transmis qu&apos;à cette fin et au moment où vous lancez
            l&apos;analyse.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Stockage et sécurité
          </h2>
          <p className="mt-2">
            Draidly conserve votre compte, vos tâches, vos analyses et les
            documents que vous générez afin de vous les présenter. Vos jetons
            d&apos;accès Google sont stockés de façon sécurisée pour appeler les
            API en votre nom, et transitent via des connexions chiffrées (HTTPS).
            Aucun email n&apos;est envoyé et aucune action externe n&apos;est
            effectuée sans votre clic explicite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Partage des données
          </h2>
          <p className="mt-2">
            Nous ne partageons pas vos données Google avec des tiers, hormis le
            traitement par le modèle d&apos;IA décrit ci-dessus et les
            prestataires d&apos;infrastructure strictement nécessaires au
            fonctionnement du service (hébergement, base de données), liés par
            des obligations de confidentialité.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Usage limité (Google API Services User Data Policy)
          </h2>
          <p className="mt-2">
            L&apos;utilisation et le transfert par Draidly des informations
            reçues des API Google respectent la{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google API Services User Data Policy
            </a>
            , y compris ses exigences d&apos;<strong>usage limité</strong>{" "}
            (Limited Use).
          </p>
          <p className="mt-2 italic">
            Draidly&apos;s use and transfer to any other app of information
            received from Google APIs will adhere to the Google API Services
            User Data Policy, including the Limited Use requirements.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Conservation et suppression
          </h2>
          <p className="mt-2">
            Vous pouvez supprimer définitivement votre compte et l&apos;ensemble
            de vos données à tout moment depuis{" "}
            <strong>Réglages → Confidentialité &amp; données</strong>. La
            suppression efface vos données et vos jetons Google de nos serveurs.
            Vous pouvez aussi révoquer l&apos;accès de Draidly depuis les
            réglages de sécurité de votre compte Google
            (myaccount.google.com/permissions).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <p className="mt-2">
            Pour toute question relative à vos données ou à cette politique,
            contactez-nous à <strong>{CONTACT}</strong>.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs text-muted">
        <Link href="/terms" className="hover:text-foreground">
          Conditions d&apos;utilisation
        </Link>{" "}
        ·{" "}
        <Link href="/mentions-legales" className="hover:text-foreground">
          Mentions légales
        </Link>
      </p>
    </main>
  );
}
