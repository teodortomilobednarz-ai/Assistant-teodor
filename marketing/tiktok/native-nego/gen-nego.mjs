/**
 * NutraScan — Pub dissimulée TikTok "Négociation"
 * Format : 1080×1920 px, 9 slides × 2s = 18s, 30fps
 */
import sharp from "sharp";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT   = join(__dir, "out");
const TMP   = join(__dir, ".tmp");
const FF    = "/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux";
const W = 1080, H = 1920;

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

// ─── Palette NutraScan ────────────────────────────────────────────────────────
const C = {
  bg:    "#0f1923",   // fond sombre story-like
  green: "#22c55e",   // accent nutrition / positif
  lime:  "#a3e635",
  amber: "#f59e0b",   // alerte prix élevé
  white: "#f8fafc",
  muted: "#94a3b8",
  card:  "#1e293b",
  badge: "#052e16",
};

const SANS = `font-family="'Helvetica Neue',Helvetica,Arial,sans-serif"`;

function E(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;");
}

// ─── Composants SVG ──────────────────────────────────────────────────────────

function svgWrap(body) {
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"   stop-color="#0a0f1a"/>
        <stop offset="1"   stop-color="#111827"/>
      </linearGradient>
      <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#16a34a"/>
        <stop offset="1"   stop-color="#22c55e"/>
      </linearGradient>
      <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#b45309"/>
        <stop offset="1"   stop-color="#f59e0b"/>
      </linearGradient>
      <filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>
    ${body}
  </svg>`;
}

// Barre TikTok top (caméra de face + heure) — style natif
function tikTokBar() {
  return `
    <rect x="0" y="0" width="${W}" height="88" fill="#000000" fill-opacity="0.55"/>
    <circle cx="100" cy="44" r="22" fill="#1e293b" stroke="${C.muted}" stroke-width="2"/>
    <text x="100" y="51" text-anchor="middle" ${SANS} font-size="22" fill="${C.white}">●</text>
    <text x="${W/2}" y="55" text-anchor="middle" ${SANS} font-size="40" font-weight="700" fill="${C.white}">19:42</text>
    <rect x="${W-160}" y="20" width="90" height="46" rx="12" fill="none" stroke="${C.muted}" stroke-width="3"/>
    <rect x="${W-148}" y="28" width="54" height="30" rx="8" fill="${C.green}"/>
    <rect x="${W-56}"  y="31" width="14" height="22" rx="4" fill="${C.muted}"/>
  `;
}

// Logo NutraScan petit (en bas)
function logo(color = C.green) {
  return `
    <g transform="translate(${W/2 - 180}, 1795)">
      <!-- leaf icon -->
      <path d="M28 8 C28 8 4 14 4 34 C4 48 16 58 28 54 C40 58 52 48 52 34 C52 14 28 8 28 8Z"
            fill="${color}" opacity="0.9"/>
      <path d="M28 20 L28 52" stroke="${C.bg}" stroke-width="3" stroke-linecap="round"/>
      <path d="M28 32 L18 24" stroke="${C.bg}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M28 38 L38 30" stroke="${C.bg}" stroke-width="2.5" stroke-linecap="round"/>
      <text x="74" y="46" ${SANS} font-size="52" font-weight="800" fill="${C.white}"
            letter-spacing="-1">NutraScan</text>
    </g>
  `;
}

// Sous-titre muted
function sub(text, y) {
  return `<text x="${W/2}" y="${y}" text-anchor="middle" ${SANS}
    font-size="42" fill="${C.muted}">${E(text)}</text>`;
}

// Grand titre
function title(text, y, color = C.white, size = 90) {
  return `<text x="${W/2}" y="${y}" text-anchor="middle" ${SANS}
    font-size="${size}" font-weight="800" fill="${color}" letter-spacing="-2">${E(text)}</text>`;
}

// Petite pastille badge
function badge(text, x, y, bg = C.green, fg = "#fff") {
  const pw = text.length * 18 + 32;
  return `
    <rect x="${x - pw/2}" y="${y - 30}" width="${pw}" height="44" rx="22"
          fill="${bg}" fill-opacity="0.9"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" ${SANS}
          font-size="26" font-weight="700" fill="${fg}">${E(text)}</text>
  `;
}

// Carte produit (scan simulé)
function productCard(x, y, name, price, nut, highlight = false) {
  const brd = highlight ? C.green : "#334155";
  const w = 720, h = 170;
  return `
    <rect x="${x - w/2}" y="${y}" width="${w}" height="${h}" rx="24"
          fill="${C.card}" stroke="${brd}" stroke-width="${highlight ? 3 : 1.5}"/>
    ${highlight ? `<rect x="${x - w/2}" y="${y}" width="${w}" height="6" rx="3" fill="url(#greenGrad)"/>` : ""}
    <text x="${x - w/2 + 40}" y="${y + 58}" ${SANS} font-size="36" font-weight="700"
          fill="${highlight ? C.white : C.muted}">${E(name)}</text>
    <text x="${x - w/2 + 40}" y="${y + 102}" ${SANS} font-size="30"
          fill="${C.muted}">${E(nut)}</text>
    <text x="${x + w/2 - 40}" y="${y + 80}" text-anchor="end" ${SANS}
          font-size="48" font-weight="800"
          fill="${highlight ? C.green : C.amber}">${E(price)}</text>
  `;
}

// Barre de progression "scan"
function scanBar(progress) {
  const bw = 700;
  return `
    <rect x="${W/2 - bw/2}" y="920" width="${bw}" height="12" rx="6" fill="#1e293b"/>
    <rect x="${W/2 - bw/2}" y="920" width="${bw * progress}" height="12" rx="6"
          fill="url(#greenGrad)" filter="url(#glow)"/>
    <circle cx="${W/2 - bw/2 + bw*progress}" cy="926" r="18"
            fill="${C.green}" filter="url(#glow)"/>
  `;
}

// ─── 9 Slides ────────────────────────────────────────────────────────────────

const slides = [

  // 1 — Hook : scène de vie (storytelling, pas encore de produit)
  svgWrap(`
    ${tikTokBar()}
    <!-- grain texture overlay -->
    <rect width="${W}" height="${H}" fill="#1e3a5f" fill-opacity="0.08"/>

    <!-- émoji de contexte centré haut -->
    <text x="${W/2}" y="380" text-anchor="middle" font-size="160">🛒</text>

    ${title("POV :", 560, C.muted, 72)}
    ${title("t'es au supermarché", 660, C.white, 78)}
    ${title("et tu vois ça…", 760, C.amber, 88)}

    <!-- flèche vers le bas animée visuellement -->
    <text x="${W/2}" y="1100" text-anchor="middle" ${SANS}
          font-size="80" fill="${C.white}" opacity="0.4">↓</text>

    ${logo()}
  `),

  // 2 — Le problème : prix choquant
  svgWrap(`
    ${tikTokBar()}

    <text x="${W/2}" y="400" text-anchor="middle" font-size="130">😱</text>

    ${title("24,90 €", 620, C.amber, 160)}
    ${title("pour des barres", 760, C.white, 82)}
    ${title("protéinées ??", 860, C.white, 82)}

    ${sub("(c'est le prix que j'avais l'habitude de payer)", 1040)}

    <!-- receipt-style divider -->
    <line x1="180" y1="1120" x2="${W - 180}" y2="1120"
          stroke="${C.muted}" stroke-width="2" stroke-dasharray="16 12"/>

    ${sub("…jusqu'à ce que mon amie", 1240)}
    ${title("me montre une appli.", 1360, C.green, 72)}

    ${logo()}
  `),

  // 3 — Introduction naturelle de NutraScan (scan du produit)
  svgWrap(`
    ${tikTokBar()}

    ${title("Elle sort son tel,", 360, C.muted, 68)}
    ${title("elle scanne le code-barres.", 460, C.white, 74)}

    <!-- Phone mockup simplifié -->
    <rect x="${W/2 - 170}" y="540" width="340" height="600" rx="36"
          fill="${C.card}" stroke="${C.green}" stroke-width="3"/>
    <rect x="${W/2 - 140}" y="580" width="280" height="520" rx="20" fill="#0f172a"/>

    <!-- scan laser effect -->
    <line x1="${W/2 - 130}" y1="840" x2="${W/2 + 130}" y2="840"
          stroke="${C.green}" stroke-width="4" filter="url(#glow)" opacity="0.9"/>
    <rect x="${W/2 - 130}" y="790" width="260" height="6" rx="3"
          fill="${C.green}" fill-opacity="0.3"/>

    <!-- barcode lines -->
    ${[...Array(14)].map((_, i) =>
      `<rect x="${W/2 - 100 + i*16}" y="720" width="${i%3===0?10:6}" height="120"
             rx="2" fill="${C.white}" opacity="0.7"/>`
    ).join("")}

    ${badge("NutraScan", W/2, 1200, C.green)}

    ${sub("→ Analyse en cours…", 1310)}
    ${scanBar(0.6)}

    ${logo()}
  `),

  // 4 — Résultat du scan (info nutritionnelle)
  svgWrap(`
    ${tikTokBar()}

    ${badge("✓ Analyse complète", W/2, 280, C.badge + "99", C.green)}

    ${title("Barres X-Pro 6×55g", 400, C.white, 68)}

    <!-- stats nutritionnelles -->
    <rect x="120" y="460" width="840" height="400" rx="28"
          fill="${C.card}" stroke="#1e40af" stroke-width="2"/>
    <text x="${W/2}" y="520" text-anchor="middle" ${SANS}
          font-size="34" fill="${C.muted}">VALEURS NUTRITIONNELLES / BARRE</text>

    ${["Protéines : 20g 💪", "Sucres : 8g ⚠️", "Additifs : E471, E472 🔴",
       "Score NutriScan : B+"].map((l, i) =>
      `<text x="200" y="${590 + i * 72}" ${SANS} font-size="38"
             fill="${i === 2 ? C.amber : i === 3 ? C.green : C.white}">${E(l)}</text>`
    ).join("")}

    <!-- prix actuel en rouge -->
    <text x="${W/2}" y="1040" text-anchor="middle" ${SANS}
          font-size="48" fill="${C.amber}">Prix rayon : 24,90 €  😬</text>

    <line x1="180" y1="1110" x2="${W-180}" y2="1110"
          stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="12 10"/>

    ${title("Et là…", 1230, C.white, 80)}
    ${title("elle active", 1330, C.white, 80)}

    <rect x="${W/2 - 200}" y="1390" width="400" height="80" rx="40"
          fill="url(#greenGrad)"/>
    <text x="${W/2}" y="1443" text-anchor="middle" ${SANS}
          font-size="44" font-weight="800" fill="#fff">Mode Négociation</text>

    ${logo()}
  `),

  // 5 — Explication de la fonctionnalité Négociation
  svgWrap(`
    ${tikTokBar()}

    ${title("Mode Négociation", 320, C.green, 82)}
    ${sub("ce que ça fait en 3 secondes :", 420)}

    <!-- 3 étapes -->
    ${[
      ["🔍", "Trouve tous les équivalents", "même profil nutritionnel"],
      ["💰", "Compare les prix", "en temps réel autour de toi"],
      ["🤝", "Génère une argumentation", "pour négocier en caisse"],
    ].map(([icon, h, s], i) => `
      <rect x="100" y="${540 + i * 310}" width="880" height="260" rx="28"
            fill="${C.card}" stroke="${i === 0 ? C.green : "#1e293b"}" stroke-width="2"/>
      <text x="180" y="${655 + i * 310}" font-size="72">${icon}</text>
      <text x="290" y="${630 + i * 310}" ${SANS} font-size="40" font-weight="700"
            fill="${C.white}">${E(h)}</text>
      <text x="290" y="${682 + i * 310}" ${SANS} font-size="32"
            fill="${C.muted}">${E(s)}</text>
    `).join("")}

    ${logo()}
  `),

  // 6 — L'appli trouve des alternatives
  svgWrap(`
    ${tikTokBar()}

    ${sub("NutraScan a trouvé :", 260)}
    ${title("3 alternatives", 360, C.green, 90)}
    ${title("équivalentes", 462, C.white, 90)}

    ${productCard(W/2, 520, "MaxProt Bio 6×60g", "9,90 €", "Protéines : 21g • Score A", true)}
    ${productCard(W/2, 720, "FitBar Nature 6×50g", "11,20 €", "Protéines : 19g • Score A-")}
    ${productCard(W/2, 920, "SportMix 6×55g", "10,50 €", "Protéines : 20g • Score B+")}

    <line x1="180" y1="1130" x2="${W-180}" y2="1130"
          stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="12 10"/>

    ${sub("+ Script de négociation généré :", 1220)}

    <rect x="100" y="1260" width="880" height="220" rx="24"
          fill="#052e16" stroke="${C.green}" stroke-width="2"/>
    <text x="180" y="1320" ${SANS} font-size="30" fill="${C.green}" font-weight="700">
      💬 Argument généré :
    </text>
    <text x="180" y="1372" ${SANS} font-size="30" fill="${C.white}">
      "Ce produit est à 24,90€. MaxProt Bio
    </text>
    <text x="180" y="1412" ${SANS} font-size="30" fill="${C.white}">
      identique est à 9,90€ — pouvez-vous
    </text>
    <text x="180" y="1452" ${SANS} font-size="30" fill="${C.white}">
      m'aligner sur ce prix ?"
    </text>

    ${logo()}
  `),

  // 7 — Le résultat (payoff émotionnel)
  svgWrap(`
    ${tikTokBar()}

    <text x="${W/2}" y="450" text-anchor="middle" font-size="140">🤑</text>

    ${title("Elle a payé", 640, C.muted, 72)}
    ${title("9,90 €", 760, C.green, 160)}
    ${title("au lieu de 24,90 €", 920, C.white, 74)}

    <!-- économie mise en valeur -->
    <rect x="${W/2 - 240}" y="1000" width="480" height="110" rx="55"
          fill="${C.badge}" stroke="${C.green}" stroke-width="2"/>
    <text x="${W/2}" y="1068" text-anchor="middle" ${SANS}
          font-size="52" font-weight="800" fill="${C.green}">💚 − 15 € économisés</text>

    ${sub("en moins de 30 secondes", 1240)}
    ${title("devant le rayon.", 1340, C.white, 76)}

    ${logo()}
  `),

  // 8 — CTA naturel (témoignage, pas d'appel direct)
  svgWrap(`
    ${tikTokBar()}

    ${title("J'ai téléchargé", 340, C.white, 84)}
    ${title("NutraScan", 450, C.green, 110)}
    ${title("le soir même.", 570, C.white, 84)}

    <line x1="180" y1="660" x2="${W-180}" y2="660"
          stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="12 10"/>

    ${sub("Depuis :", 740)}

    ${[
      "✅  Je scanne avant d'acheter",
      "✅  Je compare en temps réel",
      "✅  Je négocie avec des arguments",
      "✅  J'économise en moyenne 40€/mois",
    ].map((l, i) =>
      `<text x="160" y="${840 + i * 90}" ${SANS} font-size="40" fill="${C.white}">${E(l)}</text>`
    ).join("")}

    <line x1="180" y1="1230" x2="${W-180}" y2="1230"
          stroke="${C.muted}" stroke-width="1.5" stroke-dasharray="12 10"/>

    ${sub("Gratuit • App Store & Google Play", 1330)}
    ${title("nutrascan.app", 1460, C.green, 80)}

    ${logo()}
  `),

  // 9 — End card (branding pur, 3 secondes)
  svgWrap(`
    <!-- fond avec glow vert -->
    <radialGradient id="endGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0"   stop-color="#16a34a" stop-opacity="0.28"/>
      <stop offset="1"   stop-color="#0a0f1a" stop-opacity="0"/>
    </radialGradient>
    <rect width="${W}" height="${H}" fill="url(#endGlow)"/>

    <!-- grand logo centré -->
    <g transform="translate(${W/2 - 220}, 640) scale(2.8)">
      <path d="M28 8 C28 8 4 14 4 34 C4 48 16 58 28 54 C40 58 52 48 52 34 C52 14 28 8 28 8Z"
            fill="${C.green}" opacity="0.95" filter="url(#glow)"/>
      <path d="M28 20 L28 52" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <path d="M28 32 L18 24" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M28 38 L38 30" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    ${title("NutraScan", 1040, C.white, 130)}
    ${sub("Scanne. Compare. Négocie.", 1140)}

    <rect x="${W/2 - 280}" y="1220" width="560" height="90" rx="45"
          fill="url(#greenGrad)"/>
    <text x="${W/2}" y="1278" text-anchor="middle" ${SANS}
          font-size="46" font-weight="800" fill="#fff">Télécharger gratuitement</text>

    ${sub("nutrascan.app", 1420)}
  `),
];

// ─── Render ──────────────────────────────────────────────────────────────────

const SLIDE_DUR = 2;       // secondes par slide
const FPS       = 30;
const FRAMES_PER = FPS * SLIDE_DUR;

console.log(`Rendering ${slides.length} slides → ${slides.length * SLIDE_DUR}s video…`);

const framePaths = [];

for (let s = 0; s < slides.length; s++) {
  const svg = slides[s];
  for (let f = 0; f < FRAMES_PER; f++) {
    const idx  = s * FRAMES_PER + f;
    const path = join(TMP, `frame${String(idx).padStart(5, "0")}.png`);
    await sharp(Buffer.from(svg)).png().toFile(path);
    framePaths.push(path);
  }
  process.stdout.write(`  slide ${s + 1}/${slides.length} ✓\n`);
}

const outFile = join(OUT, "nutrascan-nego-native.webm");

// Playwright ffmpeg only supports image2pipe (MJPEG stdin), not image2 sequence
// Build concatenated MJPEG buffer and pipe to ffmpeg stdin
console.log("Assembling MJPEG stream…");
const jpegBuffers = [];
for (const p of framePaths) {
  jpegBuffers.push(await sharp(p).jpeg({ quality: 90 }).toBuffer());
}
const mjpegStream = Buffer.concat(jpegBuffers);

console.log(`Encoding video (${(mjpegStream.length / 1e6).toFixed(1)} MB MJPEG stream)…`);
const result = spawnSync(FF, [
  "-y",
  "-f", "image2pipe",
  "-vcodec", "mjpeg",
  "-framerate", String(FPS),
  "-i", "pipe:0",
  "-vf", "scale=1080:1920",
  outFile,
], { input: mjpegStream, stdio: ["pipe", "inherit", "inherit"], maxBuffer: 500 * 1024 * 1024 });

if (result.status !== 0) {
  throw new Error(`ffmpeg exited with code ${result.status}`);
}

// cleanup tmp
framePaths.forEach(p => rmSync(p, { force: true }));

console.log(`\n✅  Vidéo générée : ${outFile}`);
