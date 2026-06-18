# Nutrascan — Métadonnées App Store Connect

## Informations générales

| Champ | Valeur |
|---|---|
| **Nom de l'app** | Nutrascan |
| **Sous-titre** (30 car.) | Tracker IA · Calories & Macros |
| **Catégorie primaire** | Santé et forme |
| **Catégorie secondaire** | Alimentation et boissons |
| **Âge minimum** | 13+ |
| **Contenu** | Aucun contenu sensible |

---

## Description courte (170 car. — pour les résultats de recherche)

```
Photographiez vos repas, obtenez les macros en 3 secondes. IA Claude Vision · Tracker calories · Abonnement Premium sans pub.
```

---

## Description complète (4000 car. max)

```
NUTRASCAN — VOTRE COACH NUTRITIONNEL IA

Scannez. Analysez. Progressez.

Nutrascan révolutionne le suivi nutritionnel grâce à l'intelligence artificielle Claude Vision. 
Photographiez simplement votre repas et obtenez en quelques secondes un rapport détaillé : 
calories, protéines, glucides, lipides — sans saisie manuelle.

━━━ FONCTIONNALITÉS CLÉS ━━━

📸 SCAN REPAS IA
Pointez votre caméra sur n'importe quel plat. Claude Vision identifie les aliments, 
estime les portions et calcule automatiquement tous vos macronutriments.

📊 TABLEAU DE BORD INTELLIGENT
Visualisez en temps réel votre progression : anneau calorique, jauges protéines/glucides/lipides. 
Vos limites se recalculent automatiquement dès que vous mettez à jour votre poids.

🧬 ANALYSE COMPOSITION CORPORELLE (Premium)
Unique sur le marché : photographiez votre corps et obtenez une estimation scientifique 
de votre pourcentage de masse grasse par l'IA, avec recommandations personnalisées.

🎯 OBJECTIFS PERSONNALISÉS
Formule Mifflin-St Jeor, 5 niveaux d'activité, 3 objectifs (perte · maintien · prise de muscle). 
Vos macros sont calculées sur-mesure et s'adaptent à chaque modification de profil.

📓 JOURNAL ALIMENTAIRE
Historique complet de vos repas par catégorie (matin, déjeuner, dîner, collation). 
Supprimez, consultez, analysez votre semaine en un coup d'œil.

🎮 GAMIFICATION RPG
Système de progression XP, badges, messages de coach IA personnalisé. 
Choisissez votre style d'assistant : militaire, futuriste ou RPG.

☁️ SYNCHRONISATION CLOUD
Vos données sont sauvegardées automatiquement et accessibles partout.

━━━ NUTRASCAN PREMIUM ━━━

Débloquez toutes les fonctionnalités sans publicité :
• Scan repas illimité par IA
• Analyse masse grasse par IA
• Expérience sans pub
• Données privées et sécurisées

Abonnement mensuel : 9,99€/mois
Abonnement annuel : 79,99€/an (économisez 33 %)
Résiliable à tout moment.

━━━ CONFIDENTIALITÉ ━━━

Vos photos ne sont jamais stockées sur nos serveurs. 
L'identification est anonyme par UUID local. Aucune revente de données.

━━━ POUR QUI ? ━━━

• Sportifs souhaitant optimiser leurs macros
• Personnes en perte ou prise de poids
• Curieux de leur composition corporelle
• Toute personne voulant manger mieux sans se compliquer la vie

Téléchargez Nutrascan et commencez votre transformation aujourd'hui.
```

---

## Mots-clés (100 car. max, séparés par virgules)

```
calorie,macro,nutrition,scanner,repas,regime,poids,proteines,IMC,masse grasse,IA,sante,forme,tracker,fitness
```

---

## URL politique de confidentialité

```
https://[votre-domaine]/privacy-policy
```
*(hébergez le fichier store-assets/privacy-policy.html sur GitHub Pages, Notion, ou votre site)*

---

## URL support

```
https://[votre-domaine]/support
```
*(peut être la même page avec une section contact)*

---

## Notes de version (première version)

```
Version 1.0 — Lancement initial

• Scan de repas par IA (Claude Vision)
• Calcul automatique calories & macros personnalisés
• Analyse composition corporelle IA (Premium)
• Journal alimentaire quotidien
• Abonnement mensuel et annuel
• Synchronisation cloud sécurisée
```

---

## Déclarations App Store Connect

### Confidentialité des données (à renseigner dans App Store Connect)

| Type de donnée | Collectée | Utilisée pour le suivi | Liée à l'identité |
|---|---|---|---|
| Santé et forme | ✅ Oui | ❌ Non | ❌ Non |
| Données d'utilisation | ✅ Oui | ❌ Non | ❌ Non |
| Identifiants (UUID) | ✅ Oui | ❌ Non | ❌ Non |
| Publicités (AdMob) | ✅ Oui (non-Premium) | ✅ Oui | ❌ Non |

### Contenu généré par l'utilisateur
❌ Non — l'utilisateur ne publie pas de contenu public.

### Chiffrement
✅ Oui — l'app utilise HTTPS/TLS standard (cochez "Oui, algorithme standard, pas d'export requis").

### Droits IDFA (Important pour AdMob !)
Dans App Store Connect → "Publicité" → cochez que l'app affiche des publicités tierces.
Cela déclenche la demande de permission ATT (App Tracking Transparency) à l'utilisateur.

---

## Screenshots requis (à créer avec Simulator ou appareil réel)

### iPhone 6,7" (1290×2796 ou 1320×2868) — OBLIGATOIRE
1. Dashboard avec anneau calorique rempli et macros
2. Scan d'un repas avec résultat IA affiché
3. Écran abonnement Premium (plans mensuel/annuel)
4. Journal alimentaire avec entrées
5. Profil avec objectifs nutritionnels

### iPhone 5,5" (1242×2208) — OBLIGATOIRE si pas de 6,5"
*(Mêmes 5 screenshots, adapter la résolution)*

### iPad 12,9" — OPTIONNEL (non supporté : supportsTablet: false)

---

## Informations de contact (App Store Connect)

| Champ | Valeur |
|---|---|
| Prénom, Nom | *Votre nom* |
| Email | *Votre email* |
| Téléphone | *Votre téléphone* |

---

## In-App Purchases à déclarer

| Nom | ID produit | Type | Prix |
|---|---|---|---|
| Nutrascan Premium Mensuel | `com.nutrascan.app.premium_monthly` | Abonnement auto-renouvelable | 9,99€/mois |
| Nutrascan Premium Annuel | `com.nutrascan.app.premium_yearly` | Abonnement auto-renouvelable | 79,99€/an |

**Important :** créer ces deux produits dans App Store Connect → "Achats intégrés" AVANT de soumettre l'app.
