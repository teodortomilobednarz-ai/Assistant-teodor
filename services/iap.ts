import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  ErrorCode,
  type ProductSubscription,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { Platform } from 'react-native';

export const PRODUCT_IDS = {
  premium_monthly: Platform.select({
    ios: 'com.nutrascan.app.premium_monthly',
    android: 'com.nutrascan.app.premium_monthly',
  }) as string,
};

export const SUBSCRIPTION_PRICE = '9,99€';
export const SUBSCRIPTION_PERIOD = 'mois';

export async function initIAP(): Promise<boolean> {
  try {
    const result = await initConnection();
    return result;
  } catch {
    return false;
  }
}

export async function closeIAP(): Promise<void> {
  try {
    await endConnection();
  } catch {
    // Ignore
  }
}

export async function fetchPremiumProduct(): Promise<ProductSubscription[]> {
  try {
    const products = await fetchProducts({
      skus: [PRODUCT_IDS.premium_monthly],
      type: 'subs',
    });
    return (products ?? []) as ProductSubscription[];
  } catch {
    return [];
  }
}

export async function purchasePremium(): Promise<void> {
  await requestPurchase({
    request: {
      apple: { sku: PRODUCT_IDS.premium_monthly },
      google: { skus: [PRODUCT_IDS.premium_monthly] },
    },
    type: 'subs',
  });
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    return purchases.some(
      (p) =>
        p.productId === PRODUCT_IDS.premium_monthly &&
        p.purchaseState === 'purchased'
    );
  } catch {
    return false;
  }
}

export function setupPurchaseListeners(
  onSuccess: (purchase: Purchase) => Promise<void>,
  onError: (error: PurchaseError) => void
): () => void {
  const updateSub = purchaseUpdatedListener(async (purchase) => {
    if (purchase.purchaseToken) {
      await onSuccess(purchase);
      await finishTransaction({ purchase, isConsumable: false });
    }
  });

  const errorSub = purchaseErrorListener((error) => {
    onError(error);
  });

  return () => {
    updateSub.remove();
    errorSub.remove();
  };
}

export { ErrorCode };
