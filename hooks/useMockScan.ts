import * as ImagePicker from 'expo-image-picker';
import { ScanResult, GamificationMessage } from '../types/nutrition';

const MOCK_FOODS = [
  {
    id: '1',
    name: 'Bowl de Quinoa & Légumes',
    emoji: '🥗',
    quantity: '350g',
    macros: { calories: 420, protein: 18, carbs: 52, fat: 12 },
    healthScore: 92,
    isHealthy: true,
  },
  {
    id: '2',
    name: 'Pizza Margherita XXL',
    emoji: '🍕',
    quantity: '2 parts (480g)',
    macros: { calories: 980, protein: 38, carbs: 118, fat: 42 },
    healthScore: 28,
    isHealthy: false,
  },
  {
    id: '3',
    name: 'Poitrine de Poulet Grillée',
    emoji: '🍗',
    quantity: '200g',
    macros: { calories: 330, protein: 62, carbs: 0, fat: 7 },
    healthScore: 96,
    isHealthy: true,
  },
  {
    id: '4',
    name: 'Burger Double Fromage',
    emoji: '🍔',
    quantity: '280g',
    macros: { calories: 750, protein: 42, carbs: 58, fat: 38 },
    healthScore: 35,
    isHealthy: false,
  },
  {
    id: '5',
    name: 'Smoothie Bowl Açaï',
    emoji: '🫐',
    quantity: '300g',
    macros: { calories: 380, protein: 8, carbs: 68, fat: 10 },
    healthScore: 85,
    isHealthy: true,
  },
];

function getGamificationMessage(isHealthy: boolean, healthScore: number): GamificationMessage {
  if (healthScore >= 80) {
    return {
      type: 'level_up',
      title: '⬆ LEVEL UP !',
      description: 'Nutriments optimaux détectés. Votre métabolisme vous remercie, Capitaine. +50 XP de santé.',
      color: '#00FF88',
    };
  } else if (healthScore <= 40) {
    const messages = [
      {
        title: '⚠ SURCHARGE CARBONÉE DÉTECTÉE',
        description: 'Préparez-vous à une surchauffe du réacteur, Capitaine. Protocole d\'urgence calorique activé.',
      },
      {
        title: '☢ ALERTE LIPIDIQUE CRITIQUE',
        description: 'Les systèmes de refroidissement sont en surcharge. Le docteur de bord recommande une évacuation immédiate vers la salle de sport.',
      },
      {
        title: '⚡ ANOMALIE NUTRITIONNELLE',
        description: 'Détection d\'une masse suspecte à haute densité calorique. L\'IA de bord analyse les dommages collatéraux.',
      },
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return {
      type: 'cheat_meal',
      title: msg.title,
      description: msg.description,
      color: '#FF2D78',
    };
  } else {
    return {
      type: 'neutral',
      title: '◈ ANALYSE COMPLÈTE',
      description: 'Rapport nutritionnel enregistré dans la base de données de bord. Continuez sur cette trajectoire.',
      color: '#00D9FF',
    };
  }
}

export async function launchMockScan(): Promise<ScanResult | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const randomFood = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];

  return {
    food: randomFood,
    imageUri: result.assets[0].uri,
    isHealthy: randomFood.isHealthy,
    gamificationMessage: getGamificationMessage(randomFood.isHealthy, randomFood.healthScore),
  };
}

export async function launchMockCamera(): Promise<ScanResult | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const randomFood = MOCK_FOODS[Math.floor(Math.random() * MOCK_FOODS.length)];

  return {
    food: randomFood,
    imageUri: result.assets[0].uri,
    isHealthy: randomFood.isHealthy,
    gamificationMessage: getGamificationMessage(randomFood.isHealthy, randomFood.healthScore),
  };
}
