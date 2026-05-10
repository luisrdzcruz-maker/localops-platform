"use client";

import {
  Camera,
  FilePieChart,
  FileText,
  Receipt,
  ScrollText,
  Upload,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { addDocumentAction } from "@/lib/documents/actions";
import { cn } from "@/lib/utils/cn";
import type { DocumentType } from "@/types/documents";

type CardKey =
  | "factura"
  | "camara"
  | "ticket"
  | "albaran"
  | "paquete";

interface UploadCardSpec {
  key: CardKey;
  icon: LucideIcon;
  title: string;
  description: string;
  documentType: DocumentType | null;
  /** When true, the file picker uses the device camera. */
  useCamera?: boolean;
  /** Accept attribute on the underlying input. */
  accept: string;
  /** Tagline shown under the action button. */
  hint: string;
}

const CARDS: UploadCardSpec[] = [
  {
    key: "factura",
    icon: Upload,
    title: "Subir factura o PDF",
    description:
      "Sube facturas de proveedor en PDF o imagen para tenerlas centralizadas con el resto de la operativa.",
    documentType: "factura_proveedor",
    accept: "application/pdf,image/*",
    hint: "Se guarda solo el nombre del fichero en la demo. Sin OCR ni envío externo.",
  },
  {
    key: "camara",
    icon: Camera,
    title: "Fotografiar factura",
    description:
      "En móvil abre la cámara para capturar una factura o ticket en papel.",
    documentType: "factura_proveedor",
    useCamera: true,
    accept: "image/*",
    hint: "Disponible en la siguiente fase: captura móvil con OCR asistido.",
  },
  {
    key: "ticket",
    icon: Receipt,
    title: "Subir ticket / gasto",
    description:
      "Tickets de gasto operativo (suministros, material, dietas) que luego se asocian a la sección de Finanzas.",
    documentType: "ticket_gasto",
    accept: "application/pdf,image/*",
    hint: "PharmaOps no liquida tickets — sólo los registra para revisión interna.",
  },
  {
    key: "albaran",
    icon: ScrollText,
    title: "Subir albarán",
    description:
      "Albaranes recibidos del distribuidor que se cuadrarán contra la factura cuando llegue.",
    documentType: "albaran",
    accept: "application/pdf,image/*",
    hint: "Útil para revisar entregas antes de aceptar la factura.",
  },
  {
    key: "paquete",
    icon: FilePieChart,
    title: "Preparar paquete gestoría",
    description:
      "Genera el paquete agregado por categoría desde Informes y compártelo con tu gestoría.",
    documentType: null,
    accept: "",
    hint: "Reutiliza el flujo existente de Informes → Paquete para gestoría.",
  },
];

export function UploadCards() {
  const [busy, setBusy] = React.useState<CardKey | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const inputs = React.useRef<Record<string, HTMLInputElement | null>>({});

  function trigger(spec: UploadCardSpec) {
    setError(null);
    setSuccess(null);
    if (!spec.documentType) return;
    const input = inputs.current[spec.key];
    if (!input) return;
    input.value = "";
    input.click();
  }

  async function onSelect(
    spec: UploadCardSpec,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file || !spec.documentType) return;
    setBusy(spec.key);
    setError(null);
    setSuccess(null);
    try {
      await addDocumentAction({
        type: spec.documentType,
        source: spec.useCamera ? "camara_movil" : "subida_manual",
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });
      setSuccess(
        `${file.name} · registrado como "${labelFor(spec.documentType)}".`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert tone="danger" title="Error">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert tone="ok" title="Documento registrado">
          {success}
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((spec) => (
          <Card key={spec.key} className="flex h-full flex-col">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <spec.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base">{spec.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{spec.description}</CardDescription>
              <p
                className={cn(
                  "mt-3 text-[11px] leading-relaxed",
                  spec.useCamera
                    ? "text-status-warn"
                    : spec.documentType
                    ? "text-ink-500"
                    : "text-ink-500"
                )}
              >
                {spec.hint}
              </p>
            </CardContent>
            <CardFooter>
              {spec.documentType ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    disabled={busy === spec.key}
                    onClick={() => trigger(spec)}
                  >
                    {busy === spec.key ? (
                      "Registrando..."
                    ) : (
                      <>
                        {spec.useCamera ? (
                          <Camera className="h-3.5 w-3.5" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {spec.useCamera ? "Abrir cámara" : "Seleccionar fichero"}
                      </>
                    )}
                  </Button>
                  <input
                    ref={(el) => {
                      inputs.current[spec.key] = el;
                    }}
                    type="file"
                    accept={spec.accept}
                    {...(spec.useCamera ? { capture: "environment" } : {})}
                    className="hidden"
                    onChange={(e) => onSelect(spec, e)}
                  />
                </>
              ) : (
                <Link href="/reports">
                  <Button type="button" size="sm" variant="primary">
                    <FileText className="h-3.5 w-3.5" />
                    Ir a Informes
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function labelFor(type: DocumentType): string {
  switch (type) {
    case "factura_proveedor":
      return "Factura proveedor";
    case "ticket_gasto":
      return "Ticket gasto";
    case "albaran":
      return "Albarán";
    case "documento_gestoria":
      return "Documento gestoría";
  }
}
