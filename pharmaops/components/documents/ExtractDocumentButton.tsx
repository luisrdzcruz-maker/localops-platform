"use client";

import { Sparkles } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { extractDocumentInvoiceAction } from "@/lib/documents/extractionActions";

interface Props {
  documentId: string;
  hasProposal: boolean;
}

/**
 * Compact "Extraer datos" trigger used inside the documents table.
 *
 * Talks only to the Server Action — never imports an OCR provider directly.
 * The result is persisted server-side; the UI updates via revalidatePath.
 */
export function ExtractDocumentButton({ documentId, hasProposal }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await extractDocumentInvoiceAction({ documentId });
          } catch {
            /* swallowed — Server Action revalidates regardless */
          }
        })
      }
    >
      <Sparkles className="h-3.5 w-3.5" />
      {pending
        ? "Extrayendo..."
        : hasProposal
        ? "Re-extraer"
        : "Extraer datos"}
    </Button>
  );
}
