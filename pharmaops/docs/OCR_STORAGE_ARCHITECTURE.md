# OCR & Document Storage — Target Architecture

PharmaOps treats document storage and OCR as two independent boundaries with
strict failure semantics. The MVP today implements the contract end-to-end
in a mock-only way; this doc describes how each boundary should look once
real services are wired.

The boundary is implemented in `lib/ocr/`. Settings → "Servicios externos"
always reflects the current state via `lib/pharmaops/serviceBoundary.ts`.

## Boundaries

```
┌──────────────────────────┐
│ /documents page (UI)     │
│ - upload metadata        │
│ - extraction proposal    │
│ - human review           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│ Document storage         │      │ OCR provider             │
│ - originals (PDF / img)  │      │ - extract invoice fields │
│ - signed URLs only       │      │ - return confidences     │
│ - retention policy       │      │ - never auto-confirm     │
└──────────────────────────┘      └──────────────────────────┘
        Supabase Storage                 mock | azure | google | aws
        or S3 (configurable)            (resolved per request)
```

### Why two boundaries

Document storage decisions (where the bytes live, who can read them) are
independent of OCR provider decisions (how the bytes are interpreted). A
real deployment must be able to:

- store originals in EU-resident infrastructure even if the OCR vendor is
  global;
- swap OCR vendor without re-uploading documents;
- retain originals after deleting extractions, or vice versa.

## Today (MVP)

- File bytes never leave the user's machine. Only metadata (filename, MIME
  type, page count if known, timestamps) is captured.
- OCR runs through `lib/ocr/mockProvider.ts`, which produces a deterministic
  proposal seeded from the document id. No network call.
- The OCR resolver (`lib/ocr/provider.ts`) reads `OCR_PROVIDER` and, if the
  selected provider is missing required env vars, falls back to mock and
  flags `fellBackToMock: true` so the UI can label it "Demo OCR".
- The Azure provider exists as a typed skeleton (`lib/ocr/azureProvider.ts`)
  with `isConfigured()` and `mapAzureResponseToProposal()`, but
  `extractInvoice()` throws `AzureNotConfiguredError` until activated.

## Future (production)

### Document storage

1. Two candidates, both via signed URLs:
   - **Supabase Storage** — simplest path, ties retention to the workspace.
   - **AWS S3** — preferred if the pharmacy or gestoría already lives in AWS.
2. The browser uploads through a signed URL issued by a Server Action.
   PharmaOps backend never proxies bytes.
3. Document rows in Postgres reference the storage key, never the raw URL.
4. Access control:
   - RLS limits reads to members of the document's workspace.
   - Signed URLs expire in minutes, not days.
   - Optional: server-side encryption with a workspace-specific key.
5. Retention policy is workspace-configurable and surfaced in Settings →
   Privacy. Default: 24 months for documents, 12 months for extraction
   proposals.

### OCR provider

The interface `OcrProvider` in `lib/ocr/types.ts` is the single contract.
Each implementation must:

- read the document via a server-side signed URL (never via the public URL
  visible to the browser);
- return field-by-field confidences in `InvoiceExtractionProposal`;
- never auto-confirm — the proposal is always created with
  `status: "needs_review"`;
- be selectable purely via `OCR_PROVIDER` env var.

Activation order (suggested):

1. **Azure Document Intelligence** — `prebuilt-invoice` model, EU region,
   no training data retention.
2. **AWS Textract** — `AnalyzeExpense`. Useful when the pharmacy is already
   in AWS.
3. **Google Document AI** — invoice parser. Lower priority until a customer
   asks.

### Human review remains mandatory

PharmaOps will never auto-create an expense or a purchase invoice from an
OCR proposal. The flow is:

1. Document uploaded → metadata + storage key.
2. Optional: trigger OCR → proposal stored in `documentExtractions`.
3. User reviews the proposal in `/documents` → confirms or rejects.
4. Only confirmed proposals may be promoted to a Finance entity, via a
   dedicated Server Action that re-checks workspace permissions.

## Configuration cheat sheet

| Variable | Effect |
|---|---|
| `OCR_PROVIDER=mock` | Deterministic stub. Default. |
| `OCR_PROVIDER=azure` + `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` + `_KEY` | Azure Document Intelligence becomes active. |
| `OCR_PROVIDER=aws` + `AWS_REGION` + `AWS_ACCESS_KEY_ID` + `AWS_TEXTRACT_ENABLED=true` | Textract becomes active (planned). |
| `AWS_S3_DOCUMENTS_BUCKET` | Bucket used for original document files. |
| `NEXT_PUBLIC_APP_MODE=demo` | Forces demo mode irrespective of credentials. |

Missing or partial configuration must never cause an external call. The
resolver always falls back to mock and the UI labels the proposal as
"Demo OCR".

## Non-goals

- Training a custom OCR model. PharmaOps will use prebuilt invoice models
  for the foreseeable future.
- Storing clinical or patient documents. The "Privacy" alert in `/documents`
  is non-negotiable.
- Replacing human review with a confidence threshold. Even high-confidence
  proposals need a human click before they become a financial record.
