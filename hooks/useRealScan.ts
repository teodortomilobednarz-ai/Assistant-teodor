import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeMeal } from '../services/claude';
import type { ScanResult, GamificationMessage } from '../types/nutrition';
import type { MealAnalysis } from '../services/claude';

function buildGamification(healthScore: number, description: string): GamificationMessage {
  if (healthScore >= 70) {
    return {
      type: 'level_up',
      title: '⬆ LEVEL UP !',
      description: 'Nutriments optimaux détectés. Votre organisme vous remercie. +50 XP.',
      color: '#00FF88',
    };
  }
  if (healthScore <= 35) {
    return {
      type: 'cheat_meal',
      title: '⚠ SURCHARGE CALORIQUE',
      description: "Protocole d'urgence activé. Les systèmes métaboliques sont en surchauffe, Capitaine.",
      color: '#FF2D78',
    };
  }
  return {
    type: 'neutral',
    title: '◈ ANALYSE COMPLÈTE',
    description: description || 'Rapport nutritionnel enregistré. Continuez sur cette trajectoire.',
    color: '#00D9FF',
  };
}

function analysisToScanResult(analysis: MealAnalysis, imageUri: string): ScanResult {
  const { totals, foods, description } = analysis;
  const main = foods[0];
  const name =
    foods.length > 1
      ? `${main?.name ?? 'Repas'} +${foods.length - 1}`
      : (main?.name ?? 'Repas scanné');

  const fatCalPct  = (totals.fat * 9)  / Math.max(1, totals.calories);
  const carbCalPct = (totals.carbs * 4) / Math.max(1, totals.calories);
  const protCalPct = (totals.protein * 4) / Math.max(1, totals.calories);
  const healthScore = Math.min(
    100,
    Math.max(0, Math.round(protCalPct * 80 - fatCalPct * 50 - carbCalPct * 20 + 60))
  );

  return {
    food: {
      id: Math.random().toString(36).substring(2, 10),
      name,
      emoji: '🍽️',
      quantity: main?.quantity ?? '1 portion',
      macros: totals,
      healthScore,
    },
    imageUri,
    isHealthy: healthScore >= 60,
    gamificationMessage: buildGamification(healthScore, description),
  };
}

function handleScanError(err: unknown) {
  const msg = err instanceof Error ? err.message : '';
  const isNetwork =
    msg.toLowerCase().includes('network') ||
    msg.toLowerCase().includes('fetch') ||
    msg.toLowerCase().includes('timeout') ||
    msg.toLowerCase().includes('connection');

  Alert.alert(
    isNetwork ? 'Pas de connexion' : "Erreur d'analyse",
    isNetwork
      ? 'Vérifie ta connexion internet et réessaie.'
      : "L'analyse IA a échoué. Assure-toi que la photo est bien éclairée et réessaie.",
    [{ text: 'OK' }]
  );
}

function handlePermissionDenied(type: 'camera' | 'gallery') {
  Alert.alert(
    'Permission refusée',
    type === 'camera'
      ? "Autorise l'accès à la caméra dans Réglages > Nutrascan > Caméra."
      : "Autorise l'accès aux photos dans Réglages > Nutrascan > Photos.",
    [{ text: 'OK' }]
  );
}

export function useRealScan() {
  const [isScanning, setIsScanning] = useState(false);

  const runAnalysis = useCallback(async (
    launcher: () => Promise<ImagePicker.ImagePickerResult>
  ): Promise<ScanResult | null> => {
    const result = await launcher();
    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Erreur', "Impossible de lire l'image. Réessaie.");
      return null;
    }

    setIsScanning(true);
    try {
      const analysis = await analyzeMeal(asset.base64);
      return analysisToScanResult(analysis, asset.uri);
    } catch (err) {
      handleScanError(err);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const scanWithCamera = useCallback(async (): Promise<ScanResult | null> => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      handlePermissionDenied('camera');
      return null;
    }
    return runAnalysis(() =>
      ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      })
    );
  }, [runAnalysis]);

  const scanFromGallery = useCallback(async (): Promise<ScanResult | null> => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      handlePermissionDenied('gallery');
      return null;
    }
    return runAnalysis(() =>
      ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      })
    );
  }, [runAnalysis]);

  return { isScanning, scanWithCamera, scanFromGallery };
}
