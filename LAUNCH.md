# 🚀 Go-live — runbook de lancement Draidly

Ce document enchaîne **tout ce qu'il reste à faire** pour passer de « code prêt »
à « SaaS en production sur `draidly.com`, paiements réels activés ». Suis les
phases **dans l'ordre** : chacune dépend de la précédente.

> **Qui fait quoi ?** Le code est prêt (build de prod ✅, pages légales ✅, robots
> + sitemap ✅). Les étapes ci-dessous demandent un accès à **tes comptes**
> (Vercel, Google Cloud, Stripe, registrar du domaine) — l'assistant ne peut pas
> s'y connecter à ta place. Compte **~1 h** pour la première mise en ligne, puis
> de quelques jours à quelques semaines d'attente côté **vérification Google**.

---

## Phase 0 — Pré-requis (fait une fois)

- [ ] Les 5 variables de base prêtes (voir [`SETUP.md`](SETUP.md)) :
      `GEMINI_API_KEY`, `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`,
      `AUTH_GOOGLE_SECRET`.
- [ ] Base **Neon** créée en **région Europe** (Frankfurt) → cohérent avec la
      région Vercel `cdg1` (Paris) configurée dans `vercel.json` : latence faible
      et **données hébergées dans l'UE** (argument RGPD pour tes clients FR).
- [ ] Repo GitHub connecté à Vercel.

---

## Phase 1 — Première mise en ligne (bêta sur `*.vercel.app`)

1. **Importer le repo dans Vercel** → New Project → sélectionne
   `assistant-teodor`. Framework détecté : Next.js. Ne touche pas aux commandes
   de build (le `package.json` gère `prisma generate` + `db push` + `next build`).
2. **Variables d'environnement** (Settings → Environment Variables) : ajoute les
   **5 de base**. Laisse Stripe de côté pour l'instant (Phase 4).
   Ajoute aussi `ADMIN_EMAILS=` avec ton email → accès Pro gratuit pour toi.
3. **Deploy**. Les tables se créent automatiquement au build (`db push`).
4. **Désactiver la protection de déploiement** : Settings → Deployment
   Protection → **désactive** Vercel Authentication / Password.
   ⚠️ Obligatoire, sinon le robot Google reçoit un 403 et **refuse** la
   vérification OAuth (voir [`VERIFICATION.md`](VERIFICATION.md)).
5. **OAuth Google** : ajoute l'URI de redirection de prod dans Google Cloud →
   Credentials → ton client OAuth :
   `https://TON-APP.vercel.app/api/auth/callback/google`
6. **Smoke-test bêta** : ouvre l'URL, connecte-toi (accepte l'avertissement
   « app non vérifiée »), vérifie le tableau de bord. → voir checklist Phase 6.

✅ À ce stade : **bêta utilisable** par toi + jusqu'à 100 testeurs (Test users).

---

## Phase 2 — Brancher le domaine `draidly.com`

1. **Acheter le domaine** (si pas déjà fait) chez un registrar (OVH, Namecheap…).
2. Vercel → Project → Settings → **Domains** → **Add** `draidly.com` (et
   `www.draidly.com`).
3. Chez le registrar, crée les enregistrements DNS que Vercel affiche :
   - `A` `@` → `76.76.21.21` (ou le `CNAME`/`A` indiqué par Vercel)
   - `CNAME` `www` → `cname.vercel-dns.com`
4. Attends la propagation (quelques minutes à quelques heures) → HTTPS auto.
5. **Mets à jour les URLs** une fois le domaine actif :
   - Variable Vercel `NEXT_PUBLIC_APP_URL=https://draidly.com`
   - Google OAuth : ajoute la redirection
     `https://draidly.com/api/auth/callback/google`
   - Redéploie.

---

## Phase 3 — Vérification Google OAuth (retirer l'écran « app non vérifiée »)

Suis [`VERIFICATION.md`](VERIFICATION.md) en entier. Points clés :

- [ ] Écran de consentement configuré avec `draidly.com`, `/privacy`, `/terms`,
      email de support `info@draidly.com`.
- [ ] Scopes déclarés **au minimum nécessaire** (Gmail modify/send, Calendar
      events, Drive readonly) avec justifications (modèles fournis).
- [ ] **Vidéo de démonstration** (YouTube non répertorié) montrant chaque scope.
- [ ] **Publish app → Prepare for verification** → soumettre.

> ⏳ Revue manuelle Google : quelques jours à plusieurs semaines. Les scopes
> Gmail/Drive sont « restreints » → une **évaluation de sécurité CASA**
> (annuelle, payante) sera exigée pour le grand public. Tant que ce n'est pas
> validé, la bêta fonctionne via la « voie rapide » (Test users).

---

## Phase 4 — Stripe en mode LIVE (encaisser de vrais paiements)

> ⚠️ Jusqu'ici tout était en **mode test**. Pour facturer réellement :

1. **Activer le compte Stripe** : Dashboard → renseigne identité + **IBAN** pour
   les versements. Tant que le compte n'est pas activé, pas d'encaissement réel.
2. Bascule le Dashboard sur **« Mode test » → OFF** (vue live).
3. **Recrée les produits/prix en live** : Essentiel (5 €/mois) et Pro
   (10 €/mois) — les Price IDs de test ne marchent pas en live.
4. **Webhook live** : Developers → Webhooks → Add endpoint →
   `https://draidly.com/api/stripe/webhook`. Événements à écouter :
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
   Copie le **Signing secret** (`whsec_…`).
5. **Variables Vercel** (clés **live**, commencent par `sk_live_` / `whsec_`) :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ESSENTIEL_MONTHLY`, `STRIPE_PRICE_PRO_MONTHLY`
   - (optionnel) `STRIPE_PRICE_ESSENTIEL_YEARLY`, `STRIPE_PRICE_PRO_YEARLY`
6. **Customer Portal** : Stripe → Settings → Billing → Customer portal →
   active-le (permet à tes clients de gérer/annuler leur abonnement).
7. Redéploie.
8. **Test réel** : souscris avec une vraie carte (tu pourras te rembourser),
   vérifie que le webhook passe (Stripe → Webhooks → événements à 200) et que le
   plan s'affiche bien dans `/dashboard/abonnement`.

---

## Phase 5 — Boîte mail `info@draidly.com`

Pour relever les emails de support / vérification Google :

- [ ] Configure une réception sur `info@draidly.com` (alias chez ton registrar,
      Google Workspace, ou redirection vers ton Gmail perso).
- [ ] Vérifie que tu reçois bien un email de test.

---

## Phase 6 — Smoke-test final (avant d'annoncer le lancement)

Sur `https://draidly.com`, connecté :

- [ ] Connexion Google OK → redirection onboarding → dashboard.
- [ ] **Copilote** : coller un email → résumé + réponse + tâches.
- [ ] **Boîte** : liste Gmail → ouvrir un email → « Analyser » → créer un
      brouillon (apparaît dans Gmail, **non envoyé**).
- [ ] **Agenda** : prochains événements + résumé du jour.
- [ ] **Documents** : chercher un fichier Drive → résumé.
- [ ] **Tâches** : créer / cocher.
- [ ] **Abonnement** : Checkout Stripe en live → plan actif après paiement.
- [ ] **Réglages** : profil entreprise + suppression de compte/données.
- [ ] Pages légales accessibles : `/privacy`, `/terms`, `/mentions-legales`.
- [ ] Mobile : barre d'onglets en bas fonctionnelle.

✅ Tout coché → **tu peux lancer publiquement.**

---

## Annexe — Surveillance post-lancement

- **Logs** : Vercel → Project → Logs (erreurs runtime).
- **Stripe** : Dashboard → événements webhook (doivent rester à 200).
- **Base** : Neon → Monitoring (connexions, taille).
- **Quotas Gemini** : Google AI Studio → usage (palier gratuit limité ;
  surveiller à la montée en charge).
- **Migrations** : on est en `prisma db push`. Avant d'avoir beaucoup de clients
  avec données sensibles, passer à des **migrations Prisma versionnées**.
