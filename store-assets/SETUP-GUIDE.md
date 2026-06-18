# Guide de mise en production — Nutrascan
*Tout ce que tu dois faire, dans l'ordre, étape par étape.*

---

## ÉTAPE 1 — Variables d'environnement (5 min)

Copie le fichier `.env.example` en `.env` à la racine du projet :

```bash
cp .env.example .env
```

Ouvre `.env` et remplis chaque valeur :

### 1A. Clé API Claude (Anthropic)
1. Va sur **console.anthropic.com**
2. Clique sur **API Keys** → **Create Key**
3. Copie la clé → colle dans `.env` :
   ```
   EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

### 1B. Supabase
1. Va sur **supabase.com** → ton projet
2. **Settings** (icône engrenage en bas à gauche) → **API**
3. Copie **Project URL** et **anon public** :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
   ```

### 1C. Google AdMob
1. Va sur **admob.google.com**
2. **Applications** → **Nutrascan iOS** → copie l'**ID d'application**
3. Répète pour Android
4. **Blocs d'annonces** → crée 2 blocs "Bannière" (iOS et Android) + 2 blocs "Interstitiel"
5. Remplis les 6 variables AdMob dans `.env`

---

## ÉTAPE 2 — Base de données Supabase (3 min)

1. Va sur **supabase.com** → ton projet → **SQL Editor**
2. Copie-colle tout le contenu du fichier `db-schema.sql`
3. Clique **Run** (bouton vert)
4. Tu dois voir "Success. No rows returned."

C'est tout — les 3 tables sont créées avec les bonnes permissions.

---

## ÉTAPE 3 — app.json (2 min)

Ouvre `app.json` et remplace les App IDs AdMob par tes vraies valeurs :

```json
"react-native-google-mobile-ads": {
  "androidAppId": "ca-app-pub-XXXXXXXX~XXXXXXXXXX",
  "iosAppId":     "ca-app-pub-XXXXXXXX~XXXXXXXXXX"
}
```

*(ce ne sont pas des variables d'env ici — copie directement tes App IDs)*

---

## ÉTAPE 4 — Compte Apple Developer (demain, 20 min)

1. Va sur **developer.apple.com/programs**
2. Clique **Enroll** → connecte-toi avec ton Apple ID
3. Choisis **Individual** (99$/an) ou **Organization**
4. Paye et attends la confirmation (quelques minutes à quelques heures)

**Ce dont tu auras besoin :**
- Ton **Apple ID** (email)
- Ton **Team ID** → visible dans developer.apple.com → Account → Membership
- Ton **App ID** App Store Connect → créé à l'étape 5

---

## ÉTAPE 5 — App Store Connect (après étape 4)

1. Va sur **appstoreconnect.apple.com**
2. **Mes apps** → **+** → **Nouvelle app**
3. Remplis :
   - Plateformes : iOS
   - Nom : **Nutrascan**
   - Langue principale : Français
   - Bundle ID : **com.nutrascan.app** *(crée-le d'abord dans developer.apple.com → Identifiers)*
   - SKU : `nutrascan-ios-2026`
4. **Informations sur l'app** → colle les textes du fichier `store-assets/app-store-metadata.md`
5. **Achats intégrés** → crée les 2 abonnements :
   - `com.nutrascan.app.premium_monthly` → 9,99€/mois
   - `com.nutrascan.app.premium_yearly` → 79,99€/an
6. Note ton **App ID numérique** (ex: 1234567890) → tu en auras besoin pour `eas.json`

---

## ÉTAPE 6 — Politique de confidentialité en ligne (10 min)

**Option simple — GitHub Pages (gratuit) :**

1. Crée un repo GitHub public `nutrascan-legal`
2. Mets le fichier `store-assets/privacy-policy.html` dans ce repo
3. Va dans Settings → Pages → Source : main branch → `/root`
4. Ton URL sera : `https://ton-pseudo.github.io/nutrascan-legal/privacy-policy.html`

**Option alternative — Notion :**
1. Crée une page Notion publique
2. Copie-colle le contenu de `privacy-policy.html`
3. Partage → lien public

Puis dans App Store Connect → **Informations sur l'app** → colle l'URL de ta politique.

---

## ÉTAPE 7 — EAS (Expo Application Services)

### 7A. Connexion
```bash
npx eas-cli login
# Entre ton email + mot de passe Expo
```

### 7B. Remplis eas.json
Ouvre `eas.json` et remplace les 3 placeholders :
```json
"appleId":   "ton-apple-id@email.com",
"ascAppId":  "1234567890",       ← l'App ID numérique App Store Connect
"appleTeamId": "ABC1234DEF"      ← visible sur developer.apple.com
```

### 7C. Configure les secrets EAS (une fois)
```bash
eas secret:create --scope project --name EXPO_PUBLIC_ANTHROPIC_API_KEY --value "sk-ant-..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_ANDROID_APP_ID --value "ca-app-pub-..."
eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_IOS_APP_ID --value "ca-app-pub-..."
eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_BANNER_ANDROID --value "ca-app-pub-..."
eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_BANNER_IOS --value "ca-app-pub-..."
eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID --value "ca-app-pub-..."
eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS --value "ca-app-pub-..."
```

---

## ÉTAPE 8 — Premier build iOS (20-30 min)

```bash
# Build de production
eas build --platform ios --profile production
```

EAS va :
1. Te demander de te connecter à ton compte Apple (automatique)
2. Créer un certificat de distribution
3. Créer un profil de provisioning
4. Builder l'appli sur des serveurs Apple Silicon
5. Générer un fichier `.ipa`

---

## ÉTAPE 9 — Soumission App Store

```bash
eas submit --platform ios --latest
```

EAS upload ton `.ipa` directement sur App Store Connect.

Ensuite dans App Store Connect :
1. Va dans **TestFlight** → vérifie que le build est bien là
2. Va dans **Version** → sélectionne ton build
3. Ajoute les screenshots (voir section dans `app-store-metadata.md`)
4. Clique **Soumettre pour examen**

Apple répond généralement en **24-48 heures**.

---

## Récapitulatif des URLs à noter

| Quoi | Où |
|---|---|
| Console Anthropic | console.anthropic.com |
| Dashboard Supabase | supabase.com/dashboard |
| Console AdMob | admob.google.com |
| Apple Developer | developer.apple.com |
| App Store Connect | appstoreconnect.apple.com |
| EAS Dashboard | expo.dev |

---

## Ce que tu n'as pas à faire

- ✅ Code complet → fait
- ✅ Design UI cyberpunk → fait
- ✅ Icônes (icon.png, adaptive-icon.png, splash-icon.png, favicon.png) → générées
- ✅ Politique de confidentialité RGPD → rédigée (store-assets/privacy-policy.html)
- ✅ Métadonnées App Store (description, mots-clés, IAP) → rédigées
- ✅ Base de données schema Supabase → prête (db-schema.sql)
- ✅ EAS configuré → structure prête, juste remplir les IDs
- ✅ TypeScript 0 erreur → vérifié
- ✅ ATT (App Tracking Transparency) → implémenté (obligatoire pour AdMob iOS)
- ✅ Notation App Store → demandée après le 5ème scan (expo-store-review)
- ✅ Gestion erreurs réseau → timeout 30s + messages français actionnables
- ✅ Notifications push → rappels repas 12h30 et 20h00 (expo-notifications)
- ✅ Historique du poids → graphique SVG de progression dans le profil
- ✅ ErrorBoundary → écran de crash élégant, pas de plantage silencieux
- ✅ iOS 17+ Privacy Manifest → PrivacyInfo.xcprivacy via config plugin
- ✅ GitHub Actions CI → TypeScript check + Expo Doctor automatiques
- ✅ Badge onglet Journal → nombre d'entrées du jour
- ✅ Haptics → retour tactile sur les actions importantes
- ✅ Journalisation du poids → au premier lancement + à chaque mise à jour profil
- ✅ Peer dependencies → expo-linking + react-native-worklets-core installés

---

## Ce que tu dois faire (ta checklist)

### AVANT LE BUILD — Configuration (toi)

- [ ] **`.env`** — remplir les clés : Anthropic API key + Supabase URL & anon key + 6 Ad Unit IDs AdMob
- [ ] **`db-schema.sql`** — coller dans Supabase SQL Editor → Run
- [ ] **`app.json`** — remplacer `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` et `EXPO_PUBLIC_ADMOB_IOS_APP_ID` par tes vrais App IDs AdMob
- [ ] **`eas.json`** — remplir `appleId`, `ascAppId`, `appleTeamId`

### COMPTES & SERVICES (toi)

- [ ] **Compte Apple Developer** → developer.apple.com/programs (99$/an) → noter ton Team ID
- [ ] **App Store Connect** → créer la fiche Nutrascan (Bundle ID : `com.nutrascan.app`)
- [ ] **IAP dans App Store Connect** → créer 2 abonnements auto-renouvelables :
  - `com.nutrascan.app.premium_monthly` → 9,99€/mois
  - `com.nutrascan.app.premium_yearly` → 79,99€/an
- [ ] **Héberger la privacy policy** → GitHub Pages avec `store-assets/privacy-policy.html` → coller l'URL dans App Store Connect

### BUILD & SOUMISSION (terminal)

- [ ] `npx eas-cli login` → connecte-toi à Expo
- [ ] `eas secret:create` → configurer les 9 variables (voir Étape 7C ci-dessus)
- [ ] `eas build --platform ios --profile production` → build (~25 min sur serveurs EAS)
- [ ] Tester le build sur TestFlight avant de soumettre
- [ ] Ajouter les 5 screenshots (format 1290×2796 — voir `store-assets/screenshots/`)
- [ ] `eas submit --platform ios --latest` → envoyer sur App Store Connect
- [ ] Soumettre pour examen Apple (réponse sous 24-48h)

### OPTIONNEL MAIS RECOMMANDÉ

- [ ] Configurer l'EXPO_TOKEN dans les secrets GitHub (pour le CI `build-ios` sur `main`)
- [ ] Tester les notifications sur un vrai device iOS (pas disponible dans Simulator)
- [ ] Vérifier l'ATT dialog sur un vrai device iOS 14.5+
- [ ] Tester le flow IAP en sandbox (compte de test Apple Sandbox)
