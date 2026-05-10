"use client";

import * as React from "react";
import { Select } from "@/components/ui/Input";
import { updateDocumentStatusAction } from "@/lib/documents/actions";
import {
  DOCUMENT_STATUSES,
  DOCUMENT_STATUS_LABELS,
  type DocumentRecord,
  type DocumentStatus,
} from "@/types/documents";

/**
 * Inline dropdown to change a document's status. The actual mutation is a
 * Server Action so the demo store stays consistent with the dashboard.
 */
export function DocumentStatusActions({
  document,
}: {
  document: DocumentRecord;
}) {
  const [status, setStatus] = React.useState<DocumentStatus>(document.status);
  const [pending, startTransition] = React.useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      aria-label={`Cambiar estado de ${document.fileName ?? "documento"}`}
      className="h-8 text-xs"
      onChange={(e) => {
        const next = e.target.value as DocumentStatus;
        setStatus(next);
        startTransition(async () => {
          try {
            await updateDocumentStatusAction({ id: document.id, status: next });
          } catch {
            // Roll back on failure.
            setStatus(document.status);
          }
        });
      }}
    >
      {DOCUMENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {DOCUMENT_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
