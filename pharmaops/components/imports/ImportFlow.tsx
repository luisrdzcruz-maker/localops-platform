"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  RotateCcw,
  Upload,
} from "lucide-react";
import * as React from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { suggestMapping } from "@/lib/imports/autoMap";
import { confirmImportAction } from "@/lib/imports/actions";
import {
  deriveFileMetadata,
  parseSpreadsheet,
} from "@/lib/imports/parser";
import { normalizeRows } from "@/lib/imports/normalize";
import { getImportTypeSchema, listAllFields } from "@/lib/imports/schemas";
import { validateRows } from "@/lib/imports/validate";
import { detectAdapter } from "@/lib/integrations/registry";
import {
  IMPORT_TYPES,
  IMPORT_TYPE_LABELS,
  SOURCE_SYSTEM_LABELS,
  type ColumnMapping,
  type ImportType,
  type ImportValidationResult,
  type ImportedFileMetadata,
  type NormalizedImportRow,
  type RawRow,
  type SourceSystem,
} from "@/types/imports";
import { cn } from "@/lib/utils/cn";

type Step = "upload" | "preview" | "mapping" | "validate" | "confirm" | "done";

interface ParsedState {
  metadata: ImportedFileMetadata;
  columns: string[];
  rows: RawRow[];
  previewRows: RawRow[];
  importType: ImportType;
  sourceSystem: SourceSystem;
  adapterId: string;
  detectionReason: string;
  detectionConfidence: number;
}

export function ImportFlow() {
  const [step, setStep] = React.useState<Step>("upload");
  const [parsed, setParsed] = React.useState<ParsedState | null>(null);
  const [mapping, setMapping] = React.useState<ColumnMapping>({});
  const [validation, setValidation] = React.useState<ImportValidationResult | null>(null);
  const [normalized, setNormalized] = React.useState<NormalizedImportRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState<{
    appliedCount: number;
    batchId: string;
  } | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const metadata = deriveFileMetadata(file);
      const result = await parseSpreadsheet(file, metadata);
      const detection = await detectAdapter(metadata, result.columns);
      const detected = {
        ...result,
        metadata,
        importType: detection.detection.importType,
        sourceSystem: detection.adapter.sourceSystem,
        adapterId: detection.adapter.id,
        detectionReason: detection.detection.reasoning,
        detectionConfidence: detection.detection.confidence,
      };
      setParsed(detected);
      const initialMapping = suggestMapping(detected.importType, detected.columns);
      setMapping(initialMapping);
      setStep("preview");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo leer el fichero. Asegúrate de subir un Excel o CSV válido."
      );
    } finally {
      setBusy(false);
    }
  }

  function changeImportType(next: ImportType) {
    if (!parsed) return;
    const updated = { ...parsed, importType: next };
    setParsed(updated);
    setMapping(suggestMapping(next, updated.columns));
    setValidation(null);
    setStep("preview");
  }

  function changeMapping(fieldKey: string, column: string | null) {
    setMapping((prev) => ({ ...prev, [fieldKey]: column }));
    setValidation(null);
  }

  function goToMapping() {
    setStep("mapping");
  }

  function runValidation() {
    if (!parsed) return;
    const norm = normalizeRows(parsed.importType, parsed.rows, mapping);
    setNormalized(norm);
    setValidation(validateRows(parsed.importType, norm));
    setStep("validate");
  }

  async function confirm() {
    if (!parsed || !validation) return;
    setBusy(true);
    setError(null);
    try {
      const validIndexes = new Set(
        normalized.filter((row) => {
          const issuesForRow = validation.issues.filter(
            (i) => i.rowIndex === row.__rowIndex && i.severity === "error"
          );
          return issuesForRow.length === 0;
        }).map((row) => row.__rowIndex)
      );
      const result = await confirmImportAction({
        importType: parsed.importType,
        sourceSystem: parsed.sourceSystem,
        filename: parsed.metadata.filename,
        mapping,
        rows: parsed.rows,
        normalizedRows: normalized,
        validIndexes: Array.from(validIndexes),
        metadata: {
          adapterId: parsed.adapterId,
          confidence: parsed.detectionConfidence,
        },
      });
      setConfirmed({
        appliedCount: result.appliedCount,
        batchId: result.batchId,
      });
      setStep("done");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo confirmar la importación."
      );
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setParsed(null);
    setMapping({});
    setValidation(null);
    setNormalized([]);
    setConfirmed(null);
    setError(null);
    setStep("upload");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-brand-600" />
          Nueva importación
        </CardTitle>
        <CardDescription>
          Sube un Excel/CSV. PharmaOps detecta el sistema de origen, propone un
          mapeo y valida cada fila antes de confirmar.
        </CardDescription>
        <Stepper step={step} />
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert tone="danger" title="Error" className="mb-4">
            {error}
          </Alert>
        ) : null}

        {step === "upload" ? (
          <UploadStep onFile={handleFile} busy={busy} />
        ) : null}

        {step !== "upload" && parsed ? (
          <DetectionPanel
            parsed={parsed}
            onChangeImportType={changeImportType}
          />
        ) : null}

        {step === "preview" && parsed ? (
          <PreviewStep
            parsed={parsed}
            mapping={mapping}
            onContinue={goToMapping}
          />
        ) : null}

        {step === "mapping" && parsed ? (
          <MappingStep
            parsed={parsed}
            mapping={mapping}
            onChange={changeMapping}
            onValidate={runValidation}
          />
        ) : null}

        {step === "validate" && validation && parsed ? (
          <ValidationStep
            parsed={parsed}
            validation={validation}
            normalized={normalized}
            onBack={() => setStep("mapping")}
            onConfirm={confirm}
            busy={busy}
          />
        ) : null}

        {step === "done" && confirmed ? (
          <DoneStep
            appliedCount={confirmed.appliedCount}
            onAnother={reset}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

/* --------------------------------- Stepper -------------------------------- */

function Stepper({ step }: { step: Step }) {
  const steps: Array<{ id: Step; label: string }> = [
    { id: "upload", label: "1. Subir" },
    { id: "preview", label: "2. Vista previa" },
    { id: "mapping", label: "3. Mapeo" },
    { id: "validate", label: "4. Validar" },
    { id: "done", label: "5. Confirmado" },
  ];
  const order = steps.findIndex((s) => s.id === step);
  return (
    <ol className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-medium">
      {steps.map((s, i) => {
        const active = i === order || (step === "validate" && s.id === "validate");
        const past = i < order || (step === "done" && s.id !== "done");
        return (
          <li
            key={s.id}
            className={cn(
              "rounded-full border px-2.5 py-0.5",
              active
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : past
                ? "border-status-ok/30 bg-status-okBg text-status-ok"
                : "border-ink-200 bg-white text-ink-500"
            )}
          >
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

/* ----------------------------- Step components ---------------------------- */

function UploadStep({
  onFile,
  busy,
}: {
  onFile: (file: File) => void;
  busy: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-8 text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <FileSpreadsheet className="h-8 w-8 text-brand-600" />
      <div>
        <p className="text-sm font-semibold text-ink-900">
          Arrastra un Excel/CSV o selecciona un fichero
        </p>
        <p className="text-xs text-ink-500">
          .xlsx, .xls, .csv — máximo recomendable 10 MB
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Procesando..." : "Seleccionar fichero"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function DetectionPanel({
  parsed,
  onChangeImportType,
}: {
  parsed: ParsedState;
  onChangeImportType: (type: ImportType) => void;
}) {
  return (
    <div className="mb-4 grid gap-4 rounded-lg border border-ink-200 bg-white p-4 md:grid-cols-3">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
          Fichero
        </p>
        <p className="mt-1 text-sm font-medium text-ink-900">
          {parsed.metadata.filename}
        </p>
        <p className="text-xs text-ink-500">
          {parsed.rows.length.toLocaleString("es-ES")} filas · {parsed.columns.length} columnas
        </p>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
          Adaptador detectado
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink-900">
          {SOURCE_SYSTEM_LABELS[parsed.sourceSystem]}
          <Badge tone="info" className="text-[10px]">
            {(parsed.detectionConfidence * 100).toFixed(0)}% confianza
          </Badge>
        </p>
        <p className="text-xs text-ink-500">{parsed.detectionReason}</p>
      </div>
      <div>
        <Label htmlFor="import-type">Tipo de importación</Label>
        <Select
          id="import-type"
          value={parsed.importType}
          onChange={(e) => onChangeImportType(e.target.value as ImportType)}
        >
          {IMPORT_TYPES.map((t) => (
            <option key={t} value={t}>
              {IMPORT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function PreviewStep({
  parsed,
  mapping,
  onContinue,
}: {
  parsed: ParsedState;
  mapping: ColumnMapping;
  onContinue: () => void;
}) {
  const rows = parsed.previewRows;
  const mappedColumns = Object.values(mapping).filter(Boolean) as string[];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink-600">
          Vista previa — primeras {rows.length} filas. Las columnas marcadas con
          <span className="mx-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 text-[10px] font-medium text-brand-700">
            mapeada
          </span>
          ya coinciden con un campo canónico.
        </p>
        <Button size="sm" onClick={onContinue}>
          Revisar mapeo
        </Button>
      </div>
      <Table>
        <THead>
          <TR>
            <TH className="w-10 text-right">#</TH>
            {parsed.columns.map((c) => {
              const mapped = mappedColumns.includes(c);
              return (
                <TH key={c}>
                  <span className="flex items-center gap-1">
                    {c}
                    {mapped ? (
                      <Badge tone="brand" className="text-[9px]">
                        mapeada
                      </Badge>
                    ) : null}
                  </span>
                </TH>
              );
            })}
          </TR>
        </THead>
        <TBody>
          {rows.map((row, i) => (
            <TR key={i}>
              <TD className="text-right text-ink-400">{i + 1}</TD>
              {parsed.columns.map((c) => (
                <TD key={c} className="max-w-[200px] truncate">
                  {formatCell(row[c])}
                </TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function MappingStep({
  parsed,
  mapping,
  onChange,
  onValidate,
}: {
  parsed: ParsedState;
  mapping: ColumnMapping;
  onChange: (fieldKey: string, column: string | null) => void;
  onValidate: () => void;
}) {
  const schema = getImportTypeSchema(parsed.importType);
  if (schema.required.length === 0 && schema.optional.length === 0) {
    return (
      <Alert tone="warn" title="Tipo no asignable">
        Este tipo de importación no tiene campos canónicos definidos. Cambia
        el tipo de importación para mapear las columnas.
      </Alert>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <Alert tone="info" title="Mapeo de columnas">
        Empareja cada campo del modelo PharmaOps con la columna correspondiente
        de tu fichero. Los campos en negrita son obligatorios.
      </Alert>
      <div className="grid gap-3 md:grid-cols-2">
        {listAllFields(parsed.importType).map((field) => {
          const required = schema.required.some((r) => r.key === field.key);
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={`map-${field.key}`}>
                {required ? <strong>{field.label} *</strong> : field.label}
              </Label>
              <Select
                id={`map-${field.key}`}
                value={mapping[field.key] ?? ""}
                onChange={(e) =>
                  onChange(field.key, e.target.value === "" ? null : e.target.value)
                }
              >
                <option value="">— Sin mapear —</option>
                {parsed.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button onClick={onValidate}>Validar filas</Button>
      </div>
    </div>
  );
}

function ValidationStep({
  parsed,
  validation,
  normalized,
  onBack,
  onConfirm,
  busy,
}: {
  parsed: ParsedState;
  validation: ImportValidationResult;
  normalized: NormalizedImportRow[];
  onBack: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const errors = validation.issues.filter((i) => i.severity === "error");
  const warnings = validation.issues.filter((i) => i.severity === "warning");
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryStat
          label="Filas válidas"
          value={validation.validRows}
          tone="ok"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        />
        <SummaryStat
          label="Filas con error"
          value={validation.errorRows}
          tone={validation.errorRows > 0 ? "danger" : "neutral"}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
        />
        <SummaryStat
          label="Filas con avisos"
          value={validation.warningRows}
          tone={validation.warningRows > 0 ? "warn" : "neutral"}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
        />
      </div>

      {errors.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink-700">
            Errores ({errors.length})
          </p>
          <Table>
            <THead>
              <TR>
                <TH>Fila</TH>
                <TH>Campo</TH>
                <TH>Mensaje</TH>
              </TR>
            </THead>
            <TBody>
              {errors.slice(0, 10).map((e, i) => (
                <TR key={i}>
                  <TD>{e.rowIndex + 1}</TD>
                  <TD>{e.field ?? "—"}</TD>
                  <TD>{e.message}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {errors.length > 10 ? (
            <p className="text-xs text-ink-500">
              … y {errors.length - 10} más. Las filas con error no se aplicarán.
            </p>
          ) : null}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink-700">
            Avisos ({warnings.length})
          </p>
          <ul className="list-disc pl-5 text-xs text-ink-600">
            {warnings.slice(0, 5).map((w, i) => (
              <li key={i}>
                Fila {w.rowIndex + 1}: {w.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button variant="secondary" onClick={onBack}>
          Volver al mapeo
        </Button>
        <Button onClick={onConfirm} disabled={busy || validation.validRows === 0}>
          Confirmar {validation.validRows} fila
          {validation.validRows === 1 ? "" : "s"}
        </Button>
      </div>
      {/* Reference: keep normalized in scope so future "preview applied data" CTAs work */}
      <span className="hidden">{normalized.length}</span>
      <span className="hidden">{parsed.metadata.filename}</span>
    </div>
  );
}

function DoneStep({
  appliedCount,
  onAnother,
}: {
  appliedCount: number;
  onAnother: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <CheckCircle2 className="h-10 w-10 text-status-ok" />
      <h3 className="text-lg font-semibold text-ink-900">
        Importación confirmada
      </h3>
      <p className="text-sm text-ink-600">
        Se han aplicado {appliedCount} fila{appliedCount === 1 ? "" : "s"} al
        modelo PharmaOps. Las cifras del panel se han actualizado.
      </p>
      <Button variant="secondary" onClick={onAnother}>
        <RotateCcw className="h-3.5 w-3.5" />
        Importar otro fichero
      </Button>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "ok" | "danger" | "warn" | "neutral";
  icon: React.ReactNode;
}) {
  const toneClass = {
    ok: "border-status-ok/30 bg-status-okBg text-status-ok",
    danger: "border-status-danger/30 bg-status-dangerBg text-red-900",
    warn: "border-status-warn/30 bg-status-warnBg text-amber-900",
    neutral: "border-ink-200 bg-ink-50 text-ink-700",
  }[tone];
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3", toneClass)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">
          {label}
        </p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") return value.toLocaleString("es-ES");
  return String(value);
}

export function ImportFlowSkeleton() {
  return <Skeleton className="h-72 w-full" />;
}
