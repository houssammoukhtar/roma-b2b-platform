# Roma B2B — Account Opening v4 (FigJam implementation)
Date: 2026-11-03
Design baseline: Roma B2B v3 brand identity, unchanged.
Source: Roma User Flow – Feature, Figma board oCRU1sKgDLs8lyL6vQ0Bwq
Files: apply.html; assets/b2b-flow.css; assets/b2b-flow.js; assets/b2b-flow-locale.js; b2b-api.php; status.html; review.html; assets/b2b-workflow.js; application-print.php.

## Implemented
1. Cash vs. Credit choice, without auto-granting credit.
2. Five Credit sections: legal documents; account owner; address/map/branches; purchasing/credit limit request; authorized people.
3. PDF/JPEG/PNG/WebP uploads (5 MB per file), privately encrypted using Roma's existing core.
4. Integrates with current Roma B2B user registration and encrypted state, without separate credentials.
5. Workflow statuses: draft_documents, submitted, under_review, changes_requested, rejected, approved_pending_signature, signed_submitted, accounting_pending, active.
6. Reviewer/accountant admin desk with role-based permissions and timeline.
7. Customer status, draft continuation, resubmission, signed document upload and protected documents.
8. Finance activation requires a customer code and account representative.
9. Authenticated printable application summary; browser Print > Save as PDF.
10. Five languages for the new form: Arabic, English, French, German, Spanish.
11. Location pin on OpenStreetMap with manual coordinates and branches.
12. CSRF, rate limiting, server-side validation, private document access and audit history.

## Important limitations
- Email messages are QUEUED, not sent. Connect and verify an SMTP or Bird email sender first.
- Signing is manual: download, sign and re-upload. A regulated digital-signature integration is not included.
- Print to PDF is provided via the browser; no server-side PDF library is configured.
- Cash commercial approval rules were not fully specified by the board; no automatic credit approval.
- Product prices, stock, accounts already approved, Salla links and orders are not changed.
- This release stays in Hostinger /roma-b2b-preview/ until backend security and end-to-end approval tests pass.
- Existing public root ZIP should be blocked/deleted and GitHub repo privacy reviewed.

## Data additions to the existing encrypted Roma state
b2b_applications; b2b_application_by_user; b2b_staff_roles; b2b_notifications.
No migration or schema alteration of unrelated tables.

## QA
- PHP syntactic parsing, JS syntax, and unique HTML IDs.
- Five-language coverage of all new application labels.
- Chrome desktop 1440px and mobile 390/320px.
- Test Cash and Credit paths, uploads, repeatable branches and roles, summary, and form errors without creating customer records.
- Verify remote GET /storage/* is 403 and test deployed endpoints.
- Do not use actual identification documents for tests.

## Next deployment controls
Connect mail transport, agree on retention/privacy for ID documents, verify role access, secure legacy backup ZIP, confirm rollback, then promote preview to main root in a controlled release.
