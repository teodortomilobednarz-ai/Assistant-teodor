import { supabase } from './supabase';
import type { UserProfile } from './bmr';
import type { BodyFatAnalysis } from './claude';

export interface FoodLogRow {
  id: string;
  device_id: string;
  log_date: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_time: string;
  icon: string;
  created_at: string;
}

export async function upsertProfile(deviceId: string, profile: UserProfile): Promise<void> {
  await supabase.from('user_profiles').upsert(
    {
      device_id: deviceId,
      age: profile.age,
      sex: profile.sex,
      height_cm: profile.heightCm,
      weight_kg: profile.weightKg,
      target_weight_kg: profile.targetWeightKg,
      activity_level: profile.activityLevel,
      goal: profile.goal,
      ai_style: profile.aiStyle,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'device_id' }
  );
}

export async function saveBodyFatResult(deviceId: string, analysis: BodyFatAnalysis): Promise<void> {
  await supabase.from('body_fat_analyses').insert({
    device_id: deviceId,
    estimated_body_fat_pct: analysis.estimatedBodyFatPct,
    lean_mass_kg: analysis.leanMassKg,
    fat_mass_kg: analysis.fatMassKg,
    category: analysis.category,
    recommendations: analysis.recommendations,
    confidence: analysis.confidence,
  });
}

export async function insertFoodLog(
  deviceId: string,
  entry: Omit<FoodLogRow, 'id' | 'device_id' | 'created_at'>
): Promise<void> {
  await supabase.from('daily_food_logs').insert({ device_id: deviceId, ...entry });
}

export async function deleteFoodLog(id: string): Promise<void> {
  await supabase.from('daily_food_logs').delete().eq('id', id);
}
