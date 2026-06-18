import { MacroNutrients } from '../types/nutrition';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

// Store your API key in a secure environment variable — never hardcode it
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export interface MealAnalysis {
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  totals: MacroNutrients;
  confidence: number;
  description: string;
}

export interface BodyFatAnalysis {
  estimatedBodyFatPct: number;
  leanMassKg: number;
  fatMassKg: number;
  category: string;
  recommendations: string[];
  confidence: number;
}

async function callClaude(
  imageBase64: string,
  prompt: string,
  mediaType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Claude API error ${response.status}: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
}

export async function analyzeMeal(imageBase64: string): Promise<MealAnalysis> {
  const prompt = `Tu es un expert en nutrition. Analyse cette photo de repas et retourne UNIQUEMENT un JSON valide (sans markdown) avec cette structure exacte :
{
  "foods": [
    { "name": "nom aliment", "quantity": "quantité estimée", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
  ],
  "totals": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
  "confidence": 0.85,
  "description": "Description courte du repas"
}
Estime les grammes de macros avec précision. Si tu ne peux pas identifier un aliment, marque confidence < 0.5.`;

  const raw = await callClaude(imageBase64, prompt);

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as MealAnalysis;
  } catch {
    // Fallback mock if parsing fails
    return {
      foods: [{ name: 'Aliment non identifié', quantity: 'Portion estimée', calories: 400, protein: 20, carbs: 40, fat: 15 }],
      totals: { calories: 400, protein: 20, carbs: 40, fat: 15 },
      confidence: 0.3,
      description: 'Analyse incomplète — image difficile à interpréter.',
    };
  }
}

export async function analyzeBodyFat(
  imageBase64: string,
  profile: { sex: 'male' | 'female'; weightKg: number; heightCm: number; age: number }
): Promise<BodyFatAnalysis> {
  const prompt = `Tu es un expert en composition corporelle. À partir de cette photo (vue face ou profil), et du profil suivant :
- Sexe : ${profile.sex === 'male' ? 'Homme' : 'Femme'}
- Poids : ${profile.weightKg} kg
- Taille : ${profile.heightCm} cm
- Âge : ${profile.age} ans

Estime scientifiquement le pourcentage de masse grasse. Retourne UNIQUEMENT un JSON valide :
{
  "estimatedBodyFatPct": 18.5,
  "leanMassKg": 68.2,
  "fatMassKg": 15.3,
  "category": "Fitness",
  "recommendations": ["Recommandation 1", "Recommandation 2"],
  "confidence": 0.70
}
Catégories : Essential Fat / Athletes / Fitness / Average / Obese.
Sois honnête et scientifique. confidence entre 0.5 et 0.85 pour une photo.`;

  const raw = await callClaude(imageBase64, prompt);

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as BodyFatAnalysis;
  } catch {
    return {
      estimatedBodyFatPct: 0,
      leanMassKg: 0,
      fatMassKg: 0,
      category: 'Inconnu',
      recommendations: ['Image insuffisante pour l\'analyse.'],
      confidence: 0,
    };
  }
}
