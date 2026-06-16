# Vérification Google OAuth — Draidly

Ce guide explique comment faire passer Draidly de « application non vérifiée »
à « vérifiée par Google ». **Seul le propriétaire du projet Google Cloud peut
soumettre la demande** (l'assistant n'a pas accès à ton compte Google).

## ⏱️ À savoir d'abord (attentes réalistes)

- La vérification est une **revue manuelle par les équipes Google** : compter
  de **quelques jours à plusieurs semaines**. Ce n'est pas instantané.
- Draidly utilise des **scopes « restreints »** (Gmail, Drive). Pour une mise
  en production grand public, Google exige en plus une **évaluation de sécurité
  CASA** (annuelle, payante). C'est la partie la plus lourde.
- **Tant que ce n'est pas vérifié**, l'écran « Google n'a pas validé cette
  application » s'affiche. C'est **normal** et ça ne bloque pas tes testeurs
  (voir « Voie rapide » ci-dessous).

## ✅ Voie rapide — utilisable IMMÉDIATEMENT (sans vérification)

Pour que toi et tes premiers testeurs puissiez utiliser l'app **maintenant**,
sans attendre Google :

1. Google Cloud Console → **APIs & Services → OAuth consent screen**.
2. Laisse le statut sur **« Testing »**.
3. Section **Test users** → **Add users** → ajoute ton email Google + ceux de
   tes testeurs (jusqu'à 100).
4. À la connexion, l'écran « non vérifiée » apparaît → clique
   **« Paramètres avancés » → « Accéder à Draidly (non sécurisé) »**. Tu passes,
   et l'app fonctionne à 100 %.

➡️ C'est la solution pour lancer une **bêta dès maintenant**.

## 🚀 Vérification complète (pour retirer l'écran d'avertissement au grand public)

### 1. Pré-requis côté site (DÉJÀ FAITS dans le code)
- [x] Page d'accueil publique décrivant l'app + lien vers la confidentialité
- [x] Politique de confidentialité (`/privacy`) avec la mention **Limited Use**
- [x] Conditions d'utilisation (`/terms`)
- [x] Mentions légales (`/mentions-legales`)
- [x] Suppression du compte et des données (Réglages → Confidentialité & données)
- [x] HTTPS

### 2. ⚠️ Action critique : rendre le site public pour le robot Google
Dans **Vercel → Project → Settings → Deployment Protection** : **désactive**
toute protection (Vercel Authentication / Password). Sinon Google reçoit une
erreur 403 en visitant ta page d'accueil et **refuse la vérification**.

### 3. Configurer l'écran de consentement
Google Cloud Console → **OAuth consent screen** :
- User type : **External**
- App name : **Draidly**, logo : le logo Draidly
- Adresse e-mail d'assistance : une adresse que tu relèves
- **App domain** → Application home page : `https://draidly.com`
  (idéalement ton vrai domaine `draidly.com` une fois branché)
- **Privacy policy** : `https://draidly.com/privacy`
- **Terms of service** : `https://draidly.com/terms`
- **Authorized domains** : `vercel.app` (ou `draidly.com`)
- Developer contact : ton email

### 4. Scopes
Déclare exactement les scopes utilisés (et seulement ceux-là) :
- `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
- `.../auth/gmail.modify` — lire, gérer libellés, créer des brouillons
- `.../auth/gmail.send` — envoyer une réponse sur clic explicite
- `.../auth/calendar.events` — lire et créer des événements
- `.../auth/drive.readonly` — lire les fichiers à analyser

Pour chaque scope, une **justification claire** (voir modèle ci-dessous).

### 5. Vidéo de démonstration (obligatoire)
Google demande une vidéo (YouTube non répertorié) montrant :
1. L'écran de consentement OAuth (avec l'URL `accounts.google.com` visible).
2. Comment chaque scope est utilisé dans l'app (lire un email → résumé ;
   créer un brouillon ; envoyer ; lire un événement ; lire un document Drive).
3. Le client OAuth (Client ID) visible à un moment.

### 6. Soumettre
OAuth consent screen → **Publish app** → **Prepare for verification** → remplis
le formulaire et soumets. Google répondra par email (souvent avec des
demandes de précisions — il faut itérer).

## 📝 Modèles de justification des scopes (à copier-coller)

- **gmail.modify** : « Draidly affiche la boîte de réception de l'utilisateur,
  marque les messages lus/non lus, archive et crée des brouillons de réponse
  générés par IA, à la demande explicite de l'utilisateur. »
- **gmail.send** : « Draidly envoie une réponse uniquement lorsque
  l'utilisateur clique sur "Envoyer" et confirme. Aucun envoi automatique. »
- **calendar.events** : « Draidly résume l'agenda de l'utilisateur et crée des
  événements à sa demande. »
- **drive.readonly** : « Draidly lit, à la demande de l'utilisateur, le fichier
  qu'il choisit d'analyser pour en produire un résumé. Lecture seule. »

## 💡 Conseils
- Utilise ton **vrai domaine** `draidly.com` si possible : ça rassure Google et
  c'est plus pro (page d'accueil + confidentialité sur le même domaine que le
  client OAuth).
- Garde la liste de scopes **minimale** : chaque scope restreint en plus = revue
  plus lourde.
- Réponds vite aux emails de l'équipe de vérification ; le délai dépend surtout
  de la rapidité des allers-retours.
