/**
 * Audit log store wrapper around the demo store.
 *
 * Kept separate from logAuditEvent.ts so the helper can be a Server Action
 * (the audit reads from React Server Components don't need server-only).
 */

import { DEMO_PHARMACY, DEMO_USER } from "@/lib/demo/session";
import { getDemoState } from "@/lib/demo/store";
import type { AuditLogEntry } from "@/types/localops";

interface SetInput {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export function setAuditEvent(input: SetInput): void {
  const state = getDemoState();
  const entry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    workspaceId: DEMO_PHARMACY.id,
    userId: DEMO_USER.id,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  state.auditLogs.unshift(entry);
}

export function listAuditLog(limit = 50): AuditLogEntry[] {
  const state = getDemoState();
  return state.auditLogs.slice(0, limit);
}
