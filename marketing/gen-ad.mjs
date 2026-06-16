import sharp from "sharp";
import { mkdirSync } from "node:fs";
mkdirSync("marketing/tiktok/ads", { recursive: true });
const W=1080,H=1920;
const sans='font-family="Helvetica,Arial,sans-serif"';

const defs=`<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop stop-color="#6d5cf0"/><stop offset="0.55" stop-color="#a855f7"/><stop offset="1" stop-color="#4f46e5"/></linearGradient>
  <linearGradient id="btn" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse">
    <stop stop-color="#6d5cf0"/><stop offset="1" stop-color="#c026d3"/></linearGradient>
  <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5"><stop stop-color="#ffffff" stop-opacity="0.18"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5"><stop stop-color="#22d3ee" stop-opacity="0.22"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
</defs>`;
const frame=`<rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="160" cy="320" r="460" fill="url(#glowA)"/>
  <circle cx="980" cy="1560" r="520" fill="url(#glowB)"/>`;
const footer=`<g transform="translate(${W/2-150},1772) scale(0.62)" fill="#ffffff"><path d="M32 13l4.8 12.2L49 30l-12.2 3.8L32 46l-4.8-12.2L15 30l12.2-4.8L32 13z"/></g>
  <text x="${W/2-95}" y="1820" ${sans} font-size="50" font-weight="700" fill="#ffffff">draidly.com</text>`;
const tline=(y,t,c,fs=104)=>`<text x="${W/2}" y="${y}" text-anchor="middle" ${sans} font-size="${fs}" font-weight="800" letter-spacing="-4" fill="${c}">${t}</text>`;

// glass list card with left dot/check
function card(y,label,sub,accent){
  return `<rect x="150" y="${y}" width="780" height="150" rx="32" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.30" stroke-width="2"/>
    <circle cx="232" cy="${y+75}" r="30" fill="${accent}"/>
    <text x="232" y="${y+87}" text-anchor="middle" ${sans} font-size="38" font-weight="800" fill="#ffffff">${sub}</text>
    <text x="300" y="${y+92}" ${sans} font-size="44" font-weight="700" fill="#ffffff">${label}</text>`;
}

function slideProblem(){
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}${frame}
    ${tline(300,"Ta journée",'#ffffff')}${tline(416,"d'entrepreneur :",'#ffe9a8')}
    ${card(620,"47 mails non lus","!","#ef4444")}
    ${card(800,"3 devis à faire","!","#f59e0b")}
    ${card(980,"Des RDV à caler","!","#22d3ee")}
    ${card(1160,"Relances oubliées","!","#a855f7")}
    ${tline(1500,"Et il est déjà 18 h.",'#ffffff',64)}
    ${footer}</svg>`;
}
function slideSolution(){
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}${frame}
    ${tline(300,"Draidly fait",'#ffffff')}${tline(416,"tout ça. Pour toi.",'#ffe9a8')}
    ${card(620,"Résume tes mails","✓","#10b981")}
    ${card(800,"Rédige tes réponses","✓","#10b981")}
    ${card(980,"Génère tes devis","✓","#10b981")}
    ${card(1160,"Retrouve tes infos","✓","#10b981")}
    ${tline(1500,"En quelques secondes.",'#ffffff',60)}
    ${footer}</svg>`;
}
function slideCTA(){
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}${frame}
    ${tline(440,"Reprends",'#ffffff')}${tline(556,"ton temps.",'#ffe9a8')}
    <text x="${W/2}" y="720" text-anchor="middle" ${sans} font-size="46" font-weight="500" fill="#ffffff" fill-opacity="0.92">Ton assistant IA pour PME.</text>
    <rect x="240" y="860" width="600" height="130" rx="36" fill="#ffffff"/>
    <text x="${W/2}" y="945" text-anchor="middle" ${sans} font-size="54" font-weight="800" fill="#4f46e5">Essaie gratuitement</text>
    <text x="${W/2}" y="1110" text-anchor="middle" ${sans} font-size="40" font-weight="600" fill="#ffffff">Gratuit · Essentiel 4,99€ · Pro 9,99€</text>
    <text x="${W/2}" y="1320" text-anchor="middle" ${sans} font-size="92" font-weight="800" letter-spacing="-3" fill="#ffffff">draidly.com</text>
    ${footer}</svg>`;
}

const out={ "ad-1-hero": null, "ad-2-probleme": slideProblem(), "ad-3-solution": slideSolution(), "ad-4-cta": slideCTA() };
for (const [name,svg] of Object.entries(out)){
  if(!svg) continue;
  await sharp(Buffer.from(svg)).png().toFile(`marketing/tiktok/ads/${name}.png`);
}
console.log("slides 2-4 ok");
