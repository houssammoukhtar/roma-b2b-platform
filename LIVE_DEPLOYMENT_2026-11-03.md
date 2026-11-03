# ROMA B2B — Live Deployment Record
**Date:** 2026-11-03
**Status:** Live website + account application PHP endpoints deployed; core registration and document permission checks verified. Full real-customer transaction not exercised.

## Public endpoints
- Homepage: https://dodgerblue-dugong-831028.hostingersite.com/
- Cash/Credit onboarding: https://dodgerblue-dugong-831028.hostingersite.com/business/apply.html
- Customer application status: https://dodgerblue-dugong-831028.hostingersite.com/business/status.html
- Authorized reviewer desk: https://dodgerblue-dugong-831028.hostingersite.com/business/review.html
- Backend: /business/b2b-api.php
- Retained legacy catalog: /ar/catalog
- Retained legacy customer portal: /portal.php
- Retained legacy API: /api.php

## Deployment topology
- Site root `index.php` is a 964-byte router serving `index.html` for root/home (only optional `lang` query accepted), then forwarding legacy catalog/other routes to `roma-b2b-legacy-20261103.php`.
- Root `index.html` contains the premium Roma B2B homepage with links to /business assets and forms.
- /business is managed by Hostinger Git deploy from `houssammoukhtar/roma-b2b-platform` branch main.
- /roma-b2b-preview remains a separate old preview installation, not the homepage.
- Existing /app/core.php, /storage, /config and /api.php were preserved unchanged.
- Existing production storage uses the encrypted_file driver.

## Restore plan
1. A byte-for-byte 10,668-byte v0.7.2 `index.php` is retained at `%TEMP%\roma_b2b_snapshot_20261103\index.php` on the authorized Windows device, and is present on the server as `/roma-b2b-legacy-20261103.php`. Original site and legacy copy served 200 and identical output lengths and title in read-only comparison.
2. Restore original `index.php` using Hostinger File Manager upload, then verify /, /ar/catalog, /api.php?action=state and /portal.php.
3. Root index.html can remain; Apache currently selects index.php first. No database or order rollback required because no existing storage/files were overwritten.

## Verified checks
- Root, /index.php, /ar/catalog, original API and customer portal returned HTTP 200 after go-live.
- /business/b2b-api.php?action=session returned HTTP 200 with a CSRF token.
- Anonymous /business/b2b-api.php?action=my and reviewer endpoints returned 401.
- Anonymous print summary returned 403.
- Playwright QA on mobile (320px/390px) and desktop (1440px) passed without horizontal scrolling or JS errors; Arabic & English checked live.
- Both Cash and Credit flows completed through the review screen with synthetic values locally. No actual customer application was submitted on live.

## Operational limitations and security follow-up
- Email events are currently queued in `b2b_notifications`, not delivered by verified SMTP/Bird transport.
- Document signing is print-sign-upload, not integrated legally binding digital signatures.
- No live E2E write-test or malware scanning verification for uploaded identity documents has been completed.
- Root still contains publicly accessible historic *.zip backup archives, including a 45 MB archive; move these outside public_html or deny access as a high-priority follow-up. A local copy of the primary archive exists on the authorized Windows device.
- Repository visibility remains public. No customer data, encryption keys or private config files were committed to the repository.
