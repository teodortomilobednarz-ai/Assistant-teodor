import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1080, H = 1920;
const OUT = "marketing/tiktok/carousel-1";
mkdirSync(OUT, { recursive: true });

function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

function footer(brand){
  const col = brand ? "#ffffff" : "#6d5cf0";
  return `<g transform="translate(${W/2-160},1740) scale(0.6)" fill="${col}">
    <path d="M32 13l4.8 12.2L49 30l-12.2 3.8L32 46l-4.8-12.2L15 30l12.2-4.8L32 13z"/>
    <path d="M48 36l1.9 4.8L54.7 42.7l-4.8 1.9L48 49.5l-1.9-4.8L41.3 42.7l4.8-1.9L48 36z"/>
  </g>
  <text x="${W/2-100}" y="1790" font-family="Helvetica,Arial,sans-serif" font-size="48" font-weight="700" fill="${col}">draidly.com</text>`;
}

function slide(lines, theme){
  const brand = theme === "brand";
  const bg = brand
    ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
        <stop stop-color="#6d5cf0"/><stop offset="0.55" stop-color="#a855f7"/><stop offset="1" stop-color="#4f46e5"/></linearGradient></defs>
       <rect width="${W}" height="${H}" fill="url(#bg)"/>`
    : `<rect width="${W}" height="${H}" fill="#f7f8fc"/>
       <circle cx="${W*0.2}" cy="${H*0.18}" r="420" fill="#efeaff"/>
       <circle cx="${W*0.9}" cy="${H*0.85}" r="360" fill="#efeaff"/>`;
  const fs = 118, lh = fs*1.18;
  const total = lines.length*lh;
  let y = (H-total)/2 + fs;
  const baseColor = brand ? "#ffffff" : "#161a2e";
  const accent = brand ? "#ffe9a8" : "#6d5cf0";
  const texts = lines.map(l=>{
    const col = (typeof l==="object" && l.accent) ? accent : baseColor;
    const t = esc(typeof l==="object"? l.text : l);
    const el = t ? `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="${fs}" font-weight="800" letter-spacing="-3" fill="${col}">${t}</text>` : "";
    y += lh; return el;
  }).join("\n");
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${bg}${texts}${footer(brand)}</svg>`;
}

const slides = [
  { theme:"brand", lines:["J'ai branché","une IA à","mon Gmail."] },
  { theme:"light", lines:["Ce matin :",{text:"47 mails",accent:true},"non lus."] },
  { theme:"light", lines:["Elle les a","TOUS résumés",{text:"en 30 sec.",accent:true}] },
  { theme:"light", lines:["Réponses prêtes.","Je clique,",{text:"j'envoie.",accent:true}] },
  { theme:"light", lines:["Devis, agenda,","documents…",{text:"pareil.",accent:true}] },
  { theme:"brand", lines:["Ton assistant","IA pour PME.","",{text:"Essaie gratis",accent:true}] },
];

for (let i=0;i<slides.length;i++){
  await sharp(Buffer.from(slide(slides[i].lines, slides[i].theme))).png().toFile(`${OUT}/slide-${i+1}.png`);
}
console.log("OK");
