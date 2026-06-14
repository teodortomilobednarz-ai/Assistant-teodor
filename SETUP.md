# Mise en route — guide pas à pas

Ce guide te fait passer de « code prêt » à « app en ligne et fonctionnelle ».
Tout est **gratuit**. Compte ~20 minutes. Fais les étapes dans l'ordre.

> Tu auras besoin de **5 valeurs** à coller dans Vercel (et en local) :
> `GEMINI_API_KEY`, `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`,
> `AUTH_GOOGLE_SECRET`. Garde un bloc-notes ouvert pour les recopier.

---

## 1. Clé IA — Gemini (gratuit)

1. Va sur <https://aistudio.google.com/apikey> → **Créer une clé API**.
2. Copie-la → c'est ton **`GEMINI_API_KEY`**.

## 2. Base de données — Neon (gratuit)

1. Va sur <https://neon.tech> → **Sign up** (avec GitHub).
2. **Create project** (choisis une région en Europe).
3. Sur l'écran de connexion, copie la **chaîne de connexion** (« Connection
   string », elle commence par `postgresql://…`) → c'est ton **`DATABASE_URL`**.

## 3. Secret de session — `AUTH_SECRET`

Tu peux utiliser celui-ci (déjà généré pour toi) :

```
AUTH_SECRET=jZroN5S1daHBcYZex4EINEp9m5ufqw6/rCKAbHE49XIO
```

*(Ou génère le tien avec `openssl rand -base64 33`.)*

## 4. Connexion Google + Gmail — Google Cloud (gratuit)

1. Va sur <https://console.cloud.google.com> → crée un projet (« Draidly »).
2. **APIs & Services → Library** → cherche **Gmail API** → **Enable**.
3. **APIs & Services → OAuth consent screen** :
   - Type : **External** → Create.
   - Nom de l'app, email de support : remplis.
   - **Test users → Add users** : ajoute **ta propre adresse Gmail**.
   - Enregistre. *(L'app reste en mode « Testing » : c'est normal, et suffisant
     pour toi. Google affichera un avertissement « app non vérifiée » à la
     connexion — clique « Avancé » puis « Continuer ». La vérification publique
     viendra plus tard.)*
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID** :
   - Type : **Web application**.
   - **Authorized redirect URIs** — ajoute **exactement** ces deux lignes
     (remplace `TON-APP` par le nom de ton app Vercel) :
     ```
     http://localhost:3000/api/auth/callback/google
     https://TON-APP.vercel.app/api/auth/callback/google
     ```
   - **Create** → copie le **Client ID** (`AUTH_GOOGLE_ID`) et le
     **Client secret** (`AUTH_GOOGLE_SECRET`).

> ⚠️ L'erreur n°1 en OAuth = une URL de redirection mal recopiée. Vérifie qu'il
> n'y a ni espace, ni `/` en trop, et que le domaine Vercel est le bon.

## 5. Mettre les variables dans Vercel

1. Ouvre ton projet sur <https://vercel.com> → **Settings → Environment
   Variables**.
2. Ajoute les **5 variables** (Name = Value) :
   - `GEMINI_API_KEY`
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
3. **Deployments → … → Redeploy** (pour prendre en compte les variables).

Au déploiement, les **tables de la base se créent automatiquement**. 🎉

## 6. Tester

1. Ouvre ton lien `https://TON-APP.vercel.app`.
2. **Commencer avec Google** → connecte-toi (accepte l'avertissement « app non
   vérifiée » comme expliqué à l'étape 4).
3. Tu arrives sur le **tableau de bord** :
   - **Copilote** : colle un email → résumé, réponse, tâches (sauvegardés).
   - **Boîte** : tes vrais emails Gmail → ouvre-en un → « Analyser » → édite la
     réponse → **Créer le brouillon dans Gmail** (le brouillon apparaît dans
     Gmail, **jamais envoyé**).
   - **Agenda** : tes prochains rendez-vous, un résumé IA de ta journée, et la
     création d'un événement (créé dans Google Agenda).
   - **Documents** : recherche un Google Doc dans ton Drive et obtiens un résumé.
   - **Tâches** : retrouve et coche tes tâches.

> 🔑 **Agenda + Documents** demandent des autorisations Google supplémentaires
> (Calendar + Drive). Si tu t'es déjà connecté avant leur ajout : **déconnecte-toi
> puis reconnecte-toi** — Google te redemandera ces accès une fois.

---

## En local (optionnel, pour développer)

```bash
cp .env.example .env.local   # puis colle les 5 valeurs
npm install
npm run db:push              # crée les tables
npm run dev                  # http://localhost:3000
```

## Note technique (pour plus tard)

Le schéma de base est synchronisé via `prisma db push` au déploiement (simple et
rapide pour cette phase). Avant d'avoir de vrais clients avec des données
sensibles, on passera à des **migrations Prisma** versionnées.
