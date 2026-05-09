import { ShieldCheck } from "lucide-react";

/**
 * Persistent footer disclaimer required across the app.
 *
 * Keep this short and visible — it's part of how PharmaOps avoids implying
 * regulated capabilities it does not have. Edit copy alongside legal/product.
 */
export function ComplianceFooter() {
  return (
    <footer className="border-t border-ink-100 bg-white px-6 py-3 text-[11px] leading-relaxed text-ink-500">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
        <p>
          PharmaOps es una capa de gestión operativa y análisis. No sustituye a
          Unycop, Farmatic, Nixfarma u otros sistemas oficiales de gestión
          farmacéutica. Esta versión MVP no se conecta a receta electrónica
          ni certifica cumplimiento fiscal. Los informes generados son
          herramientas de gestión y deben ser revisados por profesionales
          autorizados cuando corresponda.
        </p>
      </div>
    </footer>
  );
}
