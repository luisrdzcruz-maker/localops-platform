import type { AiActionCost, AiCreditBalance, OrganizationAiLimits } from "@/types/ai";

export interface AiUsageCheckResult { allowed: boolean; reason?: string; remainingCredits: number; }

export function checkAiUsage(action: AiActionCost, balance: AiCreditBalance, limits: OrganizationAiLimits, fileCount = 0, fileSizeMb = 0): AiUsageCheckResult {
  const remainingCredits = balance.monthlyLimit - balance.usedThisMonth;
  if (action.credits > remainingCredits) return { allowed: false, reason: "Insufficient AI credits", remainingCredits };
  if (fileCount > limits.maxBatchSize) return { allowed: false, reason: "Batch size exceeds plan limit", remainingCredits };
  if (fileSizeMb > limits.maxFileSizeMb) return { allowed: false, reason: "File size exceeds plan limit", remainingCredits };
  if (!limits.bulkProcessingEnabled && fileCount > 1) return { allowed: false, reason: "Bulk processing is not available on this plan", remainingCredits };
  return { allowed: true, remainingCredits };
}
