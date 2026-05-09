import type { OrganizationAiLimits } from "@/types/ai";

export const trialAiLimits: Omit<OrganizationAiLimits, "organizationId"> = {
  plan: "trial",
  monthlyCreditLimit: 25,
  dailyCreditLimit: 10,
  maxFileSizeMb: 5,
  maxBatchSize: 5,
  bulkProcessingEnabled: false
};

export const planAiLimits = {
  basic: { monthlyCreditLimit: 100, dailyCreditLimit: 30, maxFileSizeMb: 5, maxBatchSize: 5, bulkProcessingEnabled: false },
  pro: { monthlyCreditLimit: 750, dailyCreditLimit: 150, maxFileSizeMb: 10, maxBatchSize: 25, bulkProcessingEnabled: true },
  enterprise: { monthlyCreditLimit: 5000, dailyCreditLimit: 1000, maxFileSizeMb: 25, maxBatchSize: 250, bulkProcessingEnabled: true }
};
