# Auto-post TikTok — 5×/jour (9h · 12h · 15h · 18h · 21h)

Objectif : publier automatiquement du contenu Draidly sur TikTok à heures fixes,
sans rien faire au quotidien. Deux niveaux : **simple** (Metricool seul, marche
tout de suite) et **avancé** (n8n remplit la file tout seul).

---

## 🎬 Le contenu (déjà produit)

- 6 vidéos prêtes : `marketing/tiktok/batch/*.mp4` (POV, facture, boîte mail,
  3-en-1, recherche, gain de temps).
- 1 vidéo pub : `marketing/tiktok/ads/draidly-ad.mp4`.
- Carrousels images : `marketing/tiktok/ads/*.png` et `carousel-1/*.png`.
- Je peux en générer autant que tu veux (dis le nombre).

---

## ✅ Niveau 1 — Metricool seul (recommandé, marche aujourd'hui)

Metricool fait **lui-même** la programmation. Pas besoin de n8n pour démarrer.

1. Crée un compte sur **metricool.com** (plan gratuit pour tester).
2. **Connecte ton compte TikTok** (une seule fois — étape que seul toi peux faire).
3. Dans le **planificateur**, crée les **5 créneaux quotidiens** :
   `09:00`, `12:00`, `15:00`, `18:00`, `21:00`.
4. **Importe les vidéos** (`marketing/tiktok/batch/*.mp4`) dans la file.
5. Metricool **poste tout seul** aux heures fixes. ✔️

> Résultat : 5 posts/jour automatiques. Le seul geste récurrent = recharger la
> file quand elle se vide (je te fournis les vidéos en lot).

---

## 🤖 Niveau 2 — n8n remplit la file automatiquement (mains-libres)

Quand tu veux que même le **dépôt des vidéos** soit automatique.

### Import du workflow
1. n8n → **Workflows → Import from File** → choisis
   `marketing/n8n-tiktok-autopost.json`.
2. Le workflow contient : **Schedule (9/12/15/18/21)** → **prend la prochaine
   vidéo dans un dossier Google Drive** → **publie** → **archive la vidéo**.

### À configurer (placeholders à remplacer)
- **Google Drive** : crée 2 dossiers, `TikTok-Queue` (à poster) et
  `TikTok-Posted` (archive). Mets leurs **IDs** dans les nœuds
  *Prochaine vidéo* et *Archiver*. Connecte tes identifiants Google dans n8n.
- **Nœud « Publier sur TikTok »** : c'est un **placeholder**. Deux options :
  - **Metricool** : mets ton `X-Mc-Auth` (token API Metricool) et ton `blogId`.
    Adapte l'URL/champs à l'API Metricool en vigueur.
  - **API TikTok officielle** : remplace le nœud par un appel à l'API TikTok
    (nécessite une app développeur TikTok + OAuth).
- **Fuseau** : déjà réglé sur `Europe/Paris`.

### Activer
Active le workflow (toggle « Active »). Il tournera aux 5 heures et publiera la
prochaine vidéo de `TikTok-Queue`.

---

## ⚠️ Points importants
- **TikTok exige UNE connexion** de ton compte (Metricool ou app dev TikTok) —
  aucun outil n'y échappe.
- **5 posts/jour, c'est agressif** : varie fort le contenu (je m'en charge) pour
  éviter une baisse de portée. Idéalement commencer à 2-3/jour puis monter.
- Le nœud de publication est un **modèle** : l'API exacte (Metricool/TikTok)
  évolue, à finaliser avec tes identifiants.

## Légendes prêtes (à varier par vidéo)
- « Entrepreneur débordé ? Draidly gère tes mails, devis et agenda 😮‍💨 draidly.com »
- « POV : t'es auto-entrepreneur et t'as enfin un assistant IA 👀 draidly.com »
- « Ta facture en 1 phrase. draidly.com »

**Hashtags** : `#entrepreneur #autoentrepreneur #productivite #ia #pme #freelance
#outilia #gagnerdutemps #saas #intelligenceartificielle`
