import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const W=1080,H=1920, FF="node_modules/ffmpeg-static/ffmpeg";
const sans='font-family="Helvetica,Arial,sans-serif"';
const E=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

const defs=`<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop stop-color="#6d5cf0"/><stop offset="0.55" stop-color="#a855f7"/><stop offset="1" stop-color="#4f46e5"/></linearGradient>
  <radialGradient id="gA" cx="0.5" cy="0.5" r="0.5"><stop stop-color="#ffffff" stop-opacity="0.18"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <radialGradient id="gB" cx="0.5" cy="0.5" r="0.5"><stop stop-color="#22d3ee" stop-opacity="0.22"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
</defs>`;
const frameBrand=`<rect width="${W}" height="${H}" fill="url(#bg)"/><circle cx="160" cy="320" r="460" fill="url(#gA)"/><circle cx="980" cy="1560" r="520" fill="url(#gB)"/>`;
const frameLight=`<rect width="${W}" height="${H}" fill="#f7f8fc"/><circle cx="190" cy="300" r="430" fill="#efeaff"/><circle cx="930" cy="1600" r="380" fill="#efeaff"/>`;
const footer=t=>`<g transform="translate(${W/2-150},1772) scale(0.62)" fill="${t==='brand'?'#ffffff':'#6d5cf0'}"><path d="M32 13l4.8 12.2L49 30l-12.2 3.8L32 46l-4.8-12.2L15 30l12.2-4.8L32 13z"/></g>
  <text x="${W/2-95}" y="1820" ${sans} font-size="50" font-weight="700" fill="${t==='brand'?'#ffffff':'#6d5cf0'}">draidly.com</text>`;

function textSlide(lines, theme){
  const brand=theme==='brand';
  const base=brand?'#ffffff':'#161a2e', acc=brand?'#ffe9a8':'#6d5cf0';
  const fs=110, lh=fs*1.16, tot=lines.length*lh; let y=(H-tot)/2+fs;
  const body=lines.map(l=>{const o=typeof l==='object'; const t=E(o?l.text:l); const c=o&&l.accent?acc:base;
    const el=t?`<text x="${W/2}" y="${y}" text-anchor="middle" ${sans} font-size="${fs}" font-weight="800" letter-spacing="-4" fill="${c}">${t}</text>`:''; y+=lh; return el;}).join('');
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}${brand?frameBrand:frameLight}${body}${footer(theme)}</svg>`;
}
function cardsSlide(head, items, theme){
  const brand=theme==='brand';
  const base=brand?'#ffffff':'#161a2e', acc=brand?'#ffe9a8':'#6d5cf0';
  let y=360; const hl=head.map(h=>{const el=`<text x="${W/2}" y="${y}" text-anchor="middle" ${sans} font-size="92" font-weight="800" letter-spacing="-3" fill="${base}">${E(h)}</text>`;y+=104;return el;}).join('');
  let cy=y+40;
  const cards=items.map(it=>{
    const card=`<rect x="150" y="${cy}" width="780" height="138" rx="30" fill="${brand?'#ffffff':'#ffffff'}" fill-opacity="${brand?0.14:1}" stroke="${brand?'#ffffff':'#e6e8f3'}" stroke-opacity="${brand?0.30:1}" stroke-width="2"/>
      <circle cx="232" cy="${cy+69}" r="28" fill="${acc}"/>
      <text x="232" y="${cy+81}" text-anchor="middle" ${sans} font-size="34" font-weight="800" fill="${brand?'#4f46e5':'#ffffff'}">✓</text>
      <text x="300" y="${cy+85}" ${sans} font-size="42" font-weight="700" fill="${base}">${E(it)}</text>`;
    cy+=160; return card;}).join('');
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${defs}${brand?frameBrand:frameLight}${hl}${cards}${footer(theme)}</svg>`;
}

const C = {
  "1-pov": [
    textSlide(["POV : t'es","auto-","entrepreneur."],'brand'),
    cardsSlide(["Ta to-do :"],["Répondre aux mails","Faire les devis","Relancer les clients","Gérer l'agenda"],'light'),
    textSlide(["Draidly gère","tout ça.","",{text:"draidly.com",accent:true}],'brand'),
  ],
  "2-facture": [
    textSlide(["Ta facture","en 1 phrase."],'brand'),
    textSlide(['"Plomberie,',"2 h, 90 €/h\"",{text:"→ Facture prête.",accent:true}],'light'),
    textSlide(["Devis & factures","en 10 sec.","",{text:"draidly.com",accent:true}],'brand'),
  ],
  "3-boite": [
    textSlide(["47 mails.",{text:"30 secondes.",accent:true}],'brand'),
    cardsSlide(["Draidly :"],["Tous résumés","Triés par priorité","Réponses prêtes"],'light'),
    textSlide(["Ta boîte,","sous contrôle.","",{text:"draidly.com",accent:true}],'brand'),
  ],
  "4-3en1": [
    textSlide(["Mails. Agenda.","Devis.","Un seul outil."],'brand'),
    cardsSlide(["Tout connecté :"],["Gmail","Google Agenda","Google Drive","Devis & factures"],'light'),
    textSlide(["Ton copilote IA","pour PME.","",{text:"draidly.com",accent:true}],'brand'),
  ],
  "5-recherche": [
    textSlide(['"C\'était quand',"ma réunion avec","Camille ?\""],'brand'),
    textSlide(["Tu demandes.",{text:"Draidly répond.",accent:true},"(tes mails + agenda)"],'light'),
    textSlide(["Retrouve tout","en 2 sec.","",{text:"draidly.com",accent:true}],'brand'),
  ],
  "6-gain-temps": [
    textSlide(["Gagne 1 journée","par semaine."],'brand'),
    cardsSlide(["Automatise :"],["Emails","Devis","Relances","Agenda"],'light'),
    textSlide(["Reprends","ton temps.","",{text:"draidly.com",accent:true}],'brand'),
  ],
};

const OUT="marketing/tiktok/batch"; mkdirSync(OUT,{recursive:true});
for (const [name,slides] of Object.entries(C)){
  const dir=`${OUT}/${name}`; mkdirSync(dir,{recursive:true});
  for (let i=0;i<slides.length;i++) await sharp(Buffer.from(slides[i])).png().toFile(`${dir}/s${i+1}.png`);
  const list=slides.map((_,i)=>`file 's${i+1}.png'\nduration 3`).join('\n')+`\nfile 's${slides.length}.png'\n`;
  writeFileSync(`${dir}/list.txt`,list);
  execFileSync(FF,["-y","-f","concat","-safe","0","-i",`${dir}/list.txt`,"-vf","scale=1080:1920,format=yuv420p","-r","30","-c:v","libx264","-pix_fmt","yuv420p",`${OUT}/${name}.mp4`],{stdio:"ignore"});
  rmSync(dir,{recursive:true,force:true});
  console.log("vidéo:",name);
}
console.log("OK");
