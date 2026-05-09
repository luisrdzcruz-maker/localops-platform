# AI Cost Control

Unlimited AI usage is dangerous in a SaaS trial. Users can accidentally or intentionally burn cost through photos, OCR, invoices, PDFs, audio and repeated regeneration.

## Trial limits

- 25 AI credits per organization
- no bulk processing
- maximum 5 documents/photos
- maximum 3 AI-generated estimates
- maximum file size 5 MB
- maximum PDF pages 10

## Plan examples

Basic:
- 100 AI credits/month
- no bulk processing

Pro:
- 500–1000 AI credits/month
- limited bulk processing

Enterprise:
- custom limits and contract controls

## Required preflight

Before every AI action:

1. estimate usage
2. check organization limit
3. check permission
4. check file and batch limits
5. execute action
6. record usage
7. deduct credits

## Implementation status

The workspace includes types, action costs and a `checkAiUsage` helper. It does not call real AI providers yet.
