import "server-only";

import { Type, type Schema } from "@google/genai";

import { type InvoiceItem, parseItems } from "./billing-utils";
import { getGeminiClient } from "./gemini";

const MODEL = "gemini-2.5-flash";

const ITEMS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
        },
        required: ["description", "quantity", "unitPrice"],
        propertyOrdering: ["description", "quantity", "unitPrice"],
      },
    },
  },
  required: ["items"],
};

const SYSTEM_PROMPT = `Tu génères les lignes d'un devis ou d'une facture à partir d'une demande client, en français.
Pour chaque prestation ou produit : "description" claire, "quantity" (nombre, 1 par défaut), "unitPrice" (prix unitaire HT en euros).
Si un prix n'est pas indiqué dans la demande, propose une estimation raisonnable et cohérente pour une PME. Renvoie toujours au moins une ligne.`;

/** Generates structured invoice line items from a free-text client request. */
export async function generateInvoiceItems(
  requestText: string,
): Promise<InvoiceItem[]> {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: MODEL,
    contents: `Demande du client :\n${requestText}`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: ITEMS_SCHEMA,
      temperature: 0.3,
    },
  });

  const raw = response.text;
  if (!raw || !raw.trim()) {
    throw new Error("Réponse vide du modèle.");
  }

  const parsed = JSON.parse(raw) as { items?: unknown };
  const items = parseItems(parsed.items);
  if (items.length === 0) {
    throw new Error("Aucune ligne générée.");
  }
  return items;
}
