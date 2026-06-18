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
  premium_yearly: Platform.select({
    ios: 'com.nutrascan.app.premium_yearly',
    android: 'com.nutrascan.app.premium_yearly',
  }) as string,
};

export const PRICES = {
  monthly: '9,99€',
  yearly: '79,99€',
  monthlySavings: '',
  yearlySavings: '−33%',
};

export async function initIAP(): Promise<boolean> {
  try {
    return await initConnection();
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

export async function fetchPremiumProducts(): Promise<ProductSubscription[]> {
  try {
    const products = await fetchProducts({
      skus: [PRODUCT_IDS.premium_monthly, PRODUCT_IDS.premium_yearly],
      type: 'subs',
    });
    return (products ?? []) as ProductSubscription[];
  } catch {
    return [];
  }
}

export async function purchaseMonthly(): Promise<void> {
  await requestPurchase({
    request: {
      apple: { sku: PRODUCT_IDS.premium_monthly },
      google: { skus: [PRODUCT_IDS.premium_monthly] },
    },
    type: 'subs',
  });
}

export async function purchaseYearly(): Promise<void> {
  await requestPurchase({
    request: {
      apple: { sku: PRODUCT_IDS.premium_yearly },
      google: { skus: [PRODUCT_IDS.premium_yearly] },
    },
    type: 'subs',
  });
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    return purchases.some(
      (p) =>
        (p.productId === PRODUCT_IDS.premium_monthly ||
          p.productId === PRODUCT_IDS.premium_yearly) &&
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
