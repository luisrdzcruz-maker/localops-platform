"use client";

import * as React from "react";
import { Select } from "@/components/ui/Input";
import { updateDeliveryNoteStatusAction } from "@/lib/documents/deliveryNoteActions";
import {
  DELIVERY_NOTE_STATUSES,
  DELIVERY_NOTE_STATUS_LABELS,
  type DeliveryNote,
  type DeliveryNoteStatus,
} from "@/types/delivery-notes";

/**
 * Inline dropdown to change an albarán's workflow status. Same shape as
 * DocumentStatusActions so both surfaces feel like one product.
 */
export function DeliveryNoteStatusActions({
  note,
}: {
  note: DeliveryNote;
}) {
  const [status, setStatus] = React.useState<DeliveryNoteStatus>(note.status);
  const [pending, startTransition] = React.useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      aria-label={`Cambiar estado del albarán ${note.deliveryNoteNumber}`}
      className="h-8 text-xs"
      onChange={(e) => {
        const next = e.target.value as DeliveryNoteStatus;
        setStatus(next);
        startTransition(async () => {
          try {
            await updateDeliveryNoteStatusAction({ id: note.id, status: next });
          } catch {
            setStatus(note.status);
          }
        });
      }}
    >
      {DELIVERY_NOTE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {DELIVERY_NOTE_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
