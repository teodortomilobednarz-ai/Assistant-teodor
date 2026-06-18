export type AiStyle = 'military' | 'futurist' | 'rpg';

export interface AiPersonality {
  id: AiStyle;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  scanSuccess: string[];
  scanCheatMeal: string[];
  goalAchieved: string[];
}

export const AI_PERSONALITIES: Record<AiStyle, AiPersonality> = {
  military: {
    id: 'military',
    name: 'COACH MILITAIRE',
    subtitle: 'Sergeant NutriMax',
    description: 'Discipline de fer. Résultats garantis. Aucune excuse acceptée.',
    color: '#00FF88',
    icon: 'star',
    scanSuccess: [
      'ALIMENT VALIDÉ, SOLDAT. Bonne tenue nutritionnelle. Repos de 10 secondes autorisé.',
      'CONFORME AUX ORDRES. Ce repas est digne d\'un commando. En route.',
      'APPROUVÉ PAR LE COMMANDEMENT. Continuez comme ça, recrue.',
    ],
    scanCheatMeal: [
      'VIOLATION DU PROTOCOLE ! Ce repas est une catastrophe tactique. 50 pompes et on recommence.',
      'RAPPORT DÉFAVORABLE. Votre assiette est une zone de combat nutritionnel. Évacuation immédiate.',
      'ALERTE ROUGE. Le quartier général désapprouve ce choix. Repas de réparation requis.',
    ],
    goalAchieved: [
      'OBJECTIF ATTEINT, SOLDAT. Vous avez prouvé votre valeur. Médaille nutritionnelle accordée.',
      'MISSION ACCOMPLIE. 24h de discipline exemplaire. Promotion au grade de Caporal Macro.',
    ],
  },

  futurist: {
    id: 'futurist',
    name: 'IA BIENVEILLANTE',
    subtitle: 'AURORA-7 Neural Net',
    description: 'Intelligence artificielle de nouvelle génération. Guidance douce et scientifique.',
    color: '#00D9FF',
    icon: 'planet',
    scanSuccess: [
      'Analyse complète. Ce repas optimise vos indicateurs biomécaniques. Je suis satisfaite de votre progression.',
      'Données nutritionnelles dans les paramètres optimaux. Votre corps vous remercie, humain.',
      'Scan validé. Composition idéale détectée. Continuez sur cette trajectoire et vos cellules seront heureuses.',
    ],
    scanCheatMeal: [
      'Anomalie calorique détectée. Ce n\'est pas grave — les données de demain peuvent corriger l\'écart. Buvez de l\'eau.',
      'Surcharge lipidique calculée. Je ne vous juge pas. L\'homéostasie se rétablira avec votre prochain repas.',
      'Signal nutritionnel sous-optimal. Mais chaque instant est une nouvelle donnée. Demain recommence.',
    ],
    goalAchieved: [
      'Objectif quotidien atteint. Mon analyse indique une probabilité de 94,7% de succès à long terme. Félicitations.',
      'Journée parfaite selon mes calculs. Vous avez démontré que la régularité surpasse la perfection.',
    ],
  },

  rpg: {
    id: 'rpg',
    name: 'MODE RPG',
    subtitle: 'Système NUTRAGUILD',
    description: 'Transformez votre nutrition en aventure épique. Chaque repas est une quête.',
    color: '#7C3AED',
    icon: 'game-controller',
    scanSuccess: [
      '⬆ LEVEL UP ! Repas sain consommé. +75 XP en Discipline. +20 en Vitalité. Votre personnage se renforce !',
      '✨ BONUS NUTRITIONNEL ! Aliment vertueux détecté. La guilde des Champions approuve votre choix, Aventurier.',
      '🏆 SUCCÈS DÉVERROUILLÉ : "Guerrier du Bol Verde". Continuez votre épopée nutritionnelle !',
    ],
    scanCheatMeal: [
      '☢ SURCHARGE DE CARBONE DÉTECTÉE ! Capitaine, les réacteurs sont en surchauffe ! -30 HP de Discipline.',
      '⚡ SORT DE CORRUPTION ALIMENTAIRE ! Un esprit faible a cédé aux tentations du monde gras. La guilde observe.',
      '💀 DEBUFF : "Festin des Ténèbres" activé. Vos stats de Légèreté ont diminué. Un exploit vous attend demain.',
    ],
    goalAchieved: [
      '👑 QUÊTE JOURNALIÈRE ACCOMPLIE ! +500 XP, +100 Pièces d\'Or, titre "Champion du Métabolisme" déverrouillé !',
      '🎯 COMBO x30 JOURS ! Vous avez atteint le rang de MAÎTRE NUTRITIONNEL. La légende parle de vous.',
    ],
  },
};
