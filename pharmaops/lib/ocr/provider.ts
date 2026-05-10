/**
 * OCR provider registry. Resolves the active provider based on the
 * OCR_PROVIDER env var, with safe fallback to the mock provider when:
 *   - OCR_PROVIDER is missing or set to "mock"
 *   - the requested real provider is not configured (env vars / SDK missing)
 *
 * Server-only — protects API keys from leaking to the browser bundle.
 */

import "server-only";
import { azureOcrProvider } from "./azureProvider";
import { mockOcrProvider } from "./mockProvider";
import type {
  InvoiceExtractionProposal,
  OcrExtractInvoiceInput,
  OcrProvider,
  OcrProviderId,
} from "./types";

export interface ResolvedProvider {
  provider: OcrProvider;
  /** The id originally requested via env, before any fallback. */
  requested: OcrProviderId;
  /** True when we fell back from the requested provider to mock. */
  fellBackToMock: boolean;
  /** Human-readable explanation for logs / UI debug. */
  reason: string;
}

const REGISTRY: Record<OcrProviderId, OcrProvider> = {
  mock: mockOcrProvider,
  azure: azureOcrProvider,
  // Placeholders so the OcrProviderId union stays exhaustive without
  // shipping skeletons we wouldn't maintain.
  google: {
    id: "google",
    name: "Google Document AI",
    isConfigured: () => false,
    async extractInvoice() {
      throw new Error("Google Document AI provider not implemented yet.");
    },
  },
  aws: {
    id: "aws",
    name: "AWS Textract",
    isConfigured: () => false,
    async extractInvoice() {
      throw new Error("AWS Textract provider not implemented yet.");
    },
  },
};

function readRequestedProviderId(): OcrProviderId {
  const raw = (process.env.OCR_PROVIDER ?? "").trim().toLowerCase();
  if (raw === "azure" || raw === "google" || raw === "aws") return raw;
  return "mock";
}

export function resolveOcrProvider(): ResolvedProvider {
  const requested = readRequestedProviderId();
  const candidate = REGISTRY[requested];
  if (candidate.isConfigured()) {
    return {
      provider: candidate,
      requested,
      fellBackToMock: requested !== "mock",
      reason: `Usando proveedor ${candidate.name}.`,
    };
  }
  return {
    provider: REGISTRY.mock,
    requested,
    fellBackToMock: requested !== "mock",
    reason:
      requested === "mock"
        ? "OCR_PROVIDER no configurado. Usando proveedor demo."
        : `${candidate.name} no está configurado. Usando proveedor demo en su lugar.`,
  };
}

/**
 * Convenience: resolve and run extraction in one call. Catches provider
 * errors and falls back to the mock provider so a transient real-provider
 * failure never blocks the user from seeing a proposal.
 */
export async function extractInvoiceWithFallback(
  input: OcrExtractInvoiceInput
): Promise<{
  proposal: InvoiceExtractionProposal;
  resolution: ResolvedProvider;
}> {
  const resolution = resolveOcrProvider();
  try {
    const proposal = await resolution.provider.extractInvoice(input);
    return { proposal, resolution };
  } catch (error) {
    if (resolution.provider.id === "mock") {
      throw error;
    }
    const fallback = await mockOcrProvider.extractInvoice(input);
    fallback.warnings.push(
      `${resolution.provider.name} falló durante la extracción. Mostrando proveedor demo en su lugar.`
    );
    return {
      proposal: fallback,
      resolution: {
        provider: mockOcrProvider,
        requested: resolution.requested,
        fellBackToMock: true,
        reason: `${resolution.provider.name} lanzó error: ${
          error instanceof Error ? error.message : "desconocido"
        }`,
      },
    };
  }
}
