import {
  computeTotals,
  formatEuro,
  type InvoiceItem,
} from "@/lib/billing-utils";

export interface InvoiceDocumentProps {
  type: "devis" | "facture";
  number: string;
  dateLabel: string;
  clientName: string;
  clientEmail?: string | null;
  company: {
    name: string;
    address?: string | null;
    siret?: string | null;
    email?: string | null;
  };
  items: InvoiceItem[];
  tvaRate: number;
}

export function InvoiceDocument({
  type,
  number,
  dateLabel,
  clientName,
  clientEmail,
  company,
  items,
  tvaRate,
}: InvoiceDocumentProps) {
  const { subtotal, tva, total } = computeTotals(items, tvaRate);
  const title = type === "facture" ? "Facture" : "Devis";

  return (
    <article className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-white p-8 text-sm text-foreground shadow-sm">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-semibold">{company.name}</h1>
          {company.address && (
            <p className="mt-1 whitespace-pre-wrap text-xs text-muted">
              {company.address}
            </p>
          )}
          {company.siret && (
            <p className="text-xs text-muted">SIRET : {company.siret}</p>
          )}
          {company.email && (
            <p className="text-xs text-muted">{company.email}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-gradient text-2xl font-bold uppercase">{title}</p>
          <p className="mt-1 text-xs text-muted">N° {number}</p>
          <p className="text-xs text-muted">{dateLabel}</p>
        </div>
      </header>

      <div className="mt-8 rounded-xl bg-surface-muted p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Adressé à
        </p>
        <p className="mt-1 font-medium">{clientName}</p>
        {clientEmail && <p className="text-xs text-muted">{clientEmail}</p>}
      </div>

      <table className="mt-8 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
            <th className="py-2 font-semibold">Description</th>
            <th className="py-2 text-right font-semibold">Qté</th>
            <th className="py-2 text-right font-semibold">PU HT</th>
            <th className="py-2 text-right font-semibold">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-border/60">
              <td className="py-2.5 pr-2">{item.description}</td>
              <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
              <td className="py-2.5 text-right tabular-nums">
                {formatEuro(item.unitPrice)}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {formatEuro(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <dl className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Total HT</dt>
            <dd className="tabular-nums">{formatEuro(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>TVA ({tvaRate} %)</dt>
            <dd className="tabular-nums">{formatEuro(tva)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total TTC</dt>
            <dd className="tabular-nums">{formatEuro(total)}</dd>
          </div>
        </dl>
      </div>

      <footer className="mt-10 border-t border-border pt-4 text-xs text-muted">
        {type === "devis"
          ? "Devis valable 30 jours. Bon pour accord : date et signature."
          : "Paiement à réception. Merci de votre confiance."}
      </footer>
    </article>
  );
}
