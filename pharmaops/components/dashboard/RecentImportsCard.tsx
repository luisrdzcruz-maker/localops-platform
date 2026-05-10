import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  IMPORT_BATCH_STATUS_LABELS,
  IMPORT_TYPE_LABELS,
  SOURCE_SYSTEM_LABELS,
  type ImportBatch,
  type ImportBatchStatus,
} from "@/types/imports";
import { formatRelative } from "@/lib/utils/format";

const STATUS_TONE: Record<ImportBatchStatus, "ok" | "warn" | "danger" | "neutral" | "info"> = {
  uploaded: "info",
  detected: "info",
  mapping: "warn",
  validated: "warn",
  confirmed: "ok",
  failed: "danger",
};

interface Props {
  batches: ImportBatch[];
}

export function RecentImportsCard({ batches }: Props) {
  const recent = batches.slice(0, 5);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 truncate">
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="truncate">Importaciones recientes</span>
            </CardTitle>
            <CardDescription className="hidden sm:block">
              Últimos lotes subidos desde Unycop, Farmatic o ficheros genéricos.
            </CardDescription>
          </div>
          <Link
            href="/imports"
            className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
          >
            Ver todas
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-500">Aún no hay importaciones.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100">
            {recent.map((b) => (
              <li
                key={b.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {b.originalFilename}
                  </p>
                  <p className="truncate text-xs text-ink-500">
                    {SOURCE_SYSTEM_LABELS[b.sourceSystem]} ·{" "}
                    {IMPORT_TYPE_LABELS[
                      b.importType as keyof typeof IMPORT_TYPE_LABELS
                    ] ?? b.importType}{" "}
                    · {formatRelative(b.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <Badge tone={STATUS_TONE[b.status]} className="text-[10px]">
                    {IMPORT_BATCH_STATUS_LABELS[b.status]}
                  </Badge>
                  <span className="text-[11px] text-ink-500">
                    {b.validRowCount}/{b.rowCount} filas
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
