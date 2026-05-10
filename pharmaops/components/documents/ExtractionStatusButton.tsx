"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { setExtractionStatusAction } from "@/lib/documents/extractionActions";
import type { ExtractionStatus } from "@/lib/ocr/types";

interface Props {
  documentId: string;
  nextStatus: ExtractionStatus;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function ExtractionStatusButton({
  documentId,
  nextStatus,
  variant = "secondary",
  children,
}: Props) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await setExtractionStatusAction({ documentId, status: nextStatus });
          } catch {
            /* revalidatePath in the action will surface failures via UI state */
          }
        })
      }
    >
      {nextStatus === "confirmed" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      {pending ? "Guardando..." : children}
    </Button>
  );
}
