/**
 * Pure billing helpers shared by server and client (no server-only imports).
 */

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTotals {
  subtotal: number;
  tva: number;
  total: number;
}

export function computeTotals(
  items: InvoiceItem[],
  tvaRate: number,
): InvoiceTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const tva = subtotal * (tvaRate / 100);
  return { subtotal, tva, total: subtotal + tva };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/** Best-effort parse of the JSON `items` column into typed line items. */
export function parseItems(value: unknown): InvoiceItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
    .map((v) => ({
      description: String(v.description ?? "").trim() || "Prestation",
      quantity: Number(v.quantity) > 0 ? Number(v.quantity) : 1,
      unitPrice: Number(v.unitPrice) >= 0 ? Number(v.unitPrice) : 0,
    }));
}
