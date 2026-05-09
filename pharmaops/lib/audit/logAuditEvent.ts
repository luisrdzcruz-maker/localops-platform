"use server";

import { setAuditEvent } from "./store";

export interface AuditEventInput {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Audit event helper. In demo mode this writes to the in-memory store.
 * When Supabase wiring lands, it will additionally persist to public.audit_logs.
 */
export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  setAuditEvent(input);
}
