# Aidly

**Aidly** — l'assistant IA qui aide les dirigeants de PME et les indépendants :
il **résume** les emails, **prépare les réponses**, **crée les tâches** et
**retrouve les informations**. Moteur : **Google Gemini** (palier gratuit).
Domaine cible : `aidly.app`.

> **Statut : Palier 1 (fondation).** Application multi-utilisateurs : comptes
> (connexion Google), base de données, tableau de bord, et analyse de texte dont
> les tâches/analyses sont **sauvegardées** par utilisateur. Les connexions Gmail,
> agenda et documents arrivent aux paliers suivants.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (mode strict)
- **Tailwind CSS 4**
- **Auth.js (NextAuth v5)** — connexion Google, sessions en base
- **Prisma 6 + PostgreSQL** — persistance
- **SDK Google Gen AI** (`@google/genai`) — modèle `gemini-2.5-flash`, sorties
  structurées validées avec **Zod**

## Démarrer

1. Installer les dépendances (génère aussi le client Prisma) :

   ```bash
   npm install
   ```

2. Configurer l'environnement :

   ```bash
   cp .env.example .env.local
   ```

   Renseigner dans `.env.local` :
   - `GEMINI_API_KEY` — clé gratuite sur <https://aistudio.google.com/apikey>
   - `DATABASE_URL` — base PostgreSQL gratuite sur <https://neon.tech>
   - `AUTH_SECRET` — `openssl rand -base64 33`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — identifiants OAuth Google
     (<https://console.cloud.google.com/apis/credentials>). URI de redirection
     en dev : `http://localhost:3000/api/auth/callback/google`

3. Créer les tables :

   ```bash
   npm run db:push
   ```

4. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

   Ouvrir <http://localhost:3000>.

## Scripts

| Commande            | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Serveur de développement             |
| `npm run build`     | Build de production (Prisma + Next)  |
| `npm run start`     | Serveur de production (après build)  |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | Vérification des types (`tsc`)       |
| `npm run db:push`   | Synchronise le schéma avec la base   |
| `npm run db:studio` | Explorateur de base Prisma Studio    |

## Structure

```
.
├── app/
│   ├── page.tsx                   # Accueil public (connexion)
│   ├── dashboard/                 # Espace protégé
│   │   ├── layout.tsx             # Garde d'authentification + navigation
│   │   ├── page.tsx               # Copilote (analyse)
│   │   └── tasks/page.tsx         # Tâches sauvegardées
│   ├── api/
│   │   ├── analyze/route.ts       # Analyse + persistance
│   │   └── auth/[...nextauth]/    # Routes Auth.js
│   ├── layout.tsx · globals.css   # Layout racine + design tokens
├── auth.ts                        # Configuration Auth.js
├── components/                    # UI (copilot, auth)
├── lib/
│   ├── gemini.ts                  # Client Google Gemini
│   ├── copilot.ts                 # Appel Gemini + sortie structurée
│   ├── prisma.ts                  # Client Prisma (singleton)
│   ├── env.ts · schema.ts         # Env validé + schémas Zod
│   └── actions/                   # Server actions (auth, tâches)
├── prisma/schema.prisma           # Modèles de données
├── CLAUDE.md · ROLE.md            # Guides assistant / rôle
```

## Principe de permission

Le copilote **prépare et propose** uniquement. Il n'envoie aucun email, ne crée
aucun événement et n'effectue aucune action externe sans validation explicite de
l'utilisateur.
