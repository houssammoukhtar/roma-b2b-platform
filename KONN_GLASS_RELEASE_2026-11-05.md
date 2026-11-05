# KONN Glass 330 ml — Roma B2B release

Release date: 2026-11-05

## Objective
Display KONN dark malt glass 330 ml products on the Roma B2B public catalog, make them discoverable from the homepage, and provide dedicated B2B detail views without publishing consumer pricing.

## Source of truth
Connected Salla KONN store, category ID 1885613678 (مشروبات شعير زجاج). Pulled on 2026-11-05; only active ("sale") products were selected.

## Five included cartons
| Salla source ID | Variant | Pack |
| --- | --- | --- |
| 1925736956 | Mixed / منوع | 24 x 330 ml glass |
| 160747187 | Classic / كلاسيك | 24 x 330 ml glass |
| 904672827 | Coffee / قهوة | 24 x 330 ml glass |
| 1232424061 | Caramel / كراميل | 24 x 330 ml glass |
| 1223099127 | Vanilla / فانيليا | 24 x 330 ml glass |

Excluded: hidden older duplicate mixed product, 250 ml cans and the retail promotional bundle.

## Files
- `assets/konn-glass-products.json`: locally versioned product metadata, source URLs and original Salla CDN photography; no retail prices.
- `assets/konn-glass.js`: homepage feature, catalog injection and bilingual product detail pages.
- `assets/konn-glass.css`: responsive component styling.
- `konn-glass.html`: local B2B detail view based on the product variant in the query string.
- `assets/roma-unified.js`: conditional loader for homepage and catalog.

## Deployment
Hostinger Git pull linked to the `business` directory. Clear Hostinger server and CDN cache after deploy.

## Visibility
- Home: featured product collection immediately after the brands section.
- Catalog: five products prepended to the product grid when filters permit `brand=konn`, `category=malt`, or no filters. Search terms and existing filters continue to work.
- Detail: `/business/konn-glass.html?variant=classic&lang=ar` (also mixed, coffee, caramel, vanilla).
- B2B retail pricing is intentionally not published. Availability and wholesale pricing are confirmed through the account process.

## Important boundary
This release is a **version-controlled B2B presentation-layer catalog extension** using official KONN data. It does **not** insert five records into the older legacy PHP catalog database or its internal admin inventory. The visible product count is adjusted on rendered catalog pages. To manage these five products directly in the legacy admin or via API, a separate backend import/synchronization is required.

## Smoke tests
- Five Salla product image URLs returned HTTP 200.
- JavaScript syntax and JSON product structure validated.
- Public /ar/catalog?brand=konn renders the prior five 250 ml cans plus five new 330 ml glass products, without duplicates.
- Public /ar/catalog renders 48 visual listings (43 legacy + five added).
- New detail page and EN localized variant render successfully.
- Legacy records, prices, orders, and Salla store unchanged.

## Rollback
Remove the KONN feature loader block in `assets/roma-unified.js` and redeploy the `business` Git directory. Keep the catalog JSON and pages for rollback history. No database rollback is required because none was modified.
