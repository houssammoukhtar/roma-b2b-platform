# Roma Group B2B Platform

This repository is the dedicated source control space for Roma Group's wholesale / B2B experience.

## Current status
- **Code available:** Three-step company account application in Arabic and English (index.php).
- **Integration:** Reads the existing Roma B2B application session via /api.php?action=state and submits via /api.php?action=register.
- **Deployment strategy:** Stage in a dedicated, non-destructive subdirectory on the existing Hostinger website first; do not overwrite the active site's document root.
- **Important:** The original Hostinger website contains a larger PHP back office, catalogs, assets and persistent data. This repository is not yet a complete backup or replacement for that site.
- **Review needed:** The Figma registration flow shared by management was not accessible to automation, so the application field choices are provisional pending design verification.

## Safety rules
1. Never commit files from config/, storage/, any .env file, customer/order data or credentials.
2. Never deploy this minimal repository to the production document root until the complete application, runtime configs and rollback plan are independently verified.
3. Preserve the existing MySQL database, uploads, and private encrypted application storage.
4. Confirm this repository is **Private** before uploading the full server-side PHP application. The repository currently may be public.
5. Link the correct Hostinger site: dodgerblue-dugong-831028.hostingersite.com.
