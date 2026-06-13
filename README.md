# Copilote IA pour PME

L'assistant IA qui aide les dirigeants de PME et les indépendants : il **résume**
les emails, **prépare les réponses**, **crée les tâches** et **retrouve les
informations**. Moteur : **Google Gemini** (palier gratuit).

> **Statut : Étape 1 du MVP.** L'application analyse un texte collé (email ou
> autre) et renvoie un résumé, des points clés, un brouillon de réponse et des
> tâches. Les connexions Gmail, agenda et documents arrivent ensuite.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (mode strict)
- **Tailwind CSS 4**
- **SDK Google Gen AI** (`@google/genai`) — modèle `gemini-2.5-flash`, sorties
  structurées validées avec **Zod**

## Démarrer

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Configurer la clé API :

   ```bash
   cp .env.example .env.local
   # puis renseigner GEMINI_API_KEY dans .env.local
   ```

   Une clé gratuite se crée sur <https://aistudio.google.com/apikey>.

3. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

   Ouvrir <http://localhost:3000>.

## Scripts

| Commande            | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Serveur de développement             |
| `npm run build`     | Build de production                  |
| `npm run start`     | Serveur de production (après build)  |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | Vérification des types (`tsc`)       |

## Structure

```
.
├── app/
│   ├── api/analyze/route.ts   # Endpoint POST : texte → analyse
│   ├── layout.tsx             # Layout racine (fr)
│   ├── page.tsx               # Page d'accueil
│   └── globals.css            # Design tokens + Tailwind
├── components/copilot/        # Interface (formulaire, résultats, badges)
├── lib/
│   ├── gemini.ts              # Client Google Gemini (singleton)
│   ├── copilot.ts             # Logique cœur : appel Gemini + sortie structurée
│   ├── env.ts                 # Accès validé aux variables d'environnement
│   └── schema.ts              # Schémas Zod + types partagés
├── CLAUDE.md                  # Guide pour les assistants IA
└── ROLE.md                    # Définition du rôle de l'assistant
```

## Principe de permission

Le copilote **prépare et propose** uniquement. Il n'envoie aucun email, ne crée
aucun événement et n'effectue aucune action externe sans validation explicite de
l'utilisateur.
