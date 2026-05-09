import { CheckCircle2, Download, Plug } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  ADAPTER_STATUS_LABELS,
  PHARMACY_SYSTEM_CAPABILITY_LABELS,
  type AdapterDiagnostics,
  type AdapterStatus,
  type PharmacySystemAdapter,
} from "@/types/integrations";
import { formatRelative } from "@/lib/utils/format";

const STATUS_TONE: Record<AdapterStatus, "ok" | "warn" | "info" | "neutral" | "danger"> = {
  active: "ok",
  beta: "warn",
  file_based_only: "info",
  planned: "neutral",
  blocked: "danger",
};

interface Props {
  adapter: PharmacySystemAdapter;
  diagnostics: AdapterDiagnostics;
  /** ImportType to download a template for (Unycop / generic). */
  templateImportType?: string;
}

export function IntegrationCard({
  adapter,
  diagnostics,
  templateImportType,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Plug className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {adapter.name}
                <Badge tone={STATUS_TONE[adapter.status]} className="text-[10px]">
                  {ADAPTER_STATUS_LABELS[adapter.status]}
                </Badge>
              </CardTitle>
              <CardDescription>{adapter.tagline}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {adapter.capabilities.map((cap) => (
            <Badge key={cap} tone="neutral" className="text-[10px]">
              {PHARMACY_SYSTEM_CAPABILITY_LABELS[cap]}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-ink-500">{adapter.disclaimer}</p>
        <div className="rounded-lg border border-ink-100 bg-ink-50 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-ink-700">Diagnóstico</span>
            {diagnostics.lastSuccessAt ? (
              <span className="flex items-center gap-1 text-status-ok">
                <CheckCircle2 className="h-3 w-3" />
                Último OK {formatRelative(diagnostics.lastSuccessAt)}
              </span>
            ) : (
              <span className="text-ink-500">Sin importaciones</span>
            )}
          </div>
          <ul className="mt-1.5 list-disc pl-4 text-ink-600">
            {diagnostics.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        <Link href="/imports">
          <Button size="sm" variant="primary">
            Importar fichero
          </Button>
        </Link>
        {templateImportType ? (
          <a
            href={`/api/integrations/template?type=${encodeURIComponent(
              templateImportType
            )}`}
            download
          >
            <Button size="sm" variant="secondary">
              <Download className="h-3.5 w-3.5" />
              Plantilla
            </Button>
          </a>
        ) : null}
      </CardFooter>
    </Card>
  );
}
