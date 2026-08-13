# Doctor Aek DF Helper — Project Status

**Last Updated:** 2026-04-26
**Current Phase:** Phase 10 — Polish & Finalization [/] → In Progress

---

## Phase Overview

| Phase                    | Status          | Description                                                       |
| ------------------------ | --------------- | ----------------------------------------------------------------- |
| 1. Research & Analysis   | ✅ Done         | Data analysis, column mapping, requirements review                |
| 2. Implementation Plan   | ✅ Done         | Plan created and approved                                         |
| 3. Project Setup         | ✅ Done         | Nuxt 4.4.2 + Tailwind v4 + PrimeVue + csv-parse + read-excel-file |
| 4. Core Data Layer       | ✅ Done         | `csv-columns.ts`, `master-mapping.json` (placeholder)             |
| 5. Composables           | ✅ Done         | `useExcelParser.ts`, `useDfCalculator.ts`                         |
| 6. UI Components         | ✅ Done         | Upload zone, selectors, result tables, main page                  |
| 7. CI/CD & Monitoring    | ✅ Done         | ESLint, GitHub Actions, Vercel Analytics/Speed Insights           |
| 8. Smart Logic & UI      | ✅ Done         | ER Fallback (214), Exception Mapping, Date Grouping UI            |
| 9. Integration & Testing | [/] In Progress | Parse fixture files in browser, verify logic, fix edge cases      |

---

## Completed Tasks

- [x] Analyze requirements & business rules
- [x] Analyze CSV data structure (128 cols, no headers)
- [x] Identify column indices: AN(0), HN(7), AdmitDate(13), AdmitTime(14), ICD(107), Patient(109), Doctor(113)
- [x] Identify row sanitization rules
- [x] Create implementation plan
- [x] Get user approval
- [x] Initialize Nuxt project with pnpm
- [x] Install dependencies: primevue, @primeuix/themes, csv-parse, read-excel-file, date-fns, @tailwindcss/vite, @primevue/nuxt-module
- [x] Configure nuxt.config.ts (PrimeVue Aura theme, @tailwindcss/vite plugin, Inter font, SEO meta)
- [x] Configure CSS-first theme in main.css via @theme block (replaces tailwind.config.ts)
- [x] Fix Thai encoding for CSV parsing (UTF-8 text read before CSV parser)
- [x] Upgrade from Nuxt 3.21.2 → 4.4.2, Tailwind v3 → v4 (CSS-first, no config file)
- [x] Create assets/css/main.css (base styles, smooth transitions)
- [x] Create utils/csv-columns.ts (column index constants)
- [x] Create assets/data/master-mapping.json (placeholder ICD-10 mapping)
- [x] Create composables/useExcelParser.ts (csv-parse and read-excel-file parsing, row sanitization)
- [x] Create composables/useDfCalculator.ts (ER/Ward logic, clipboard copy)
- [x] Create components: AppHeader, FileUploadZone, DoctorSelector, ShiftDateSelector, ResultTable
- [x] Create pages/index.vue (3-step wizard: Upload → Config → Results)
- [x] UI/UX Overhaul: Transitioned to **Graphite Dark Mode** (bg: #212529, card: #2d2d30)
- [x] Icons: Replaced inline SVGs with lightweight **CSS Masking** icons
- [x] IDE Support: Configured VSCode to support Tailwind v4 @theme syntax
- [x] Infrastructure: Configured **ESLint v9 (Flat Config)** with `@nuxt/eslint`
- [x] CI/CD: Created **GitHub Actions** (`ci.yml`) for automated lint and build
- [x] Monitoring: Integrated **Vercel Analytics** and **Speed Insights**
- [x] Optimization: Enabled `ssr: false` for pure SPA performance and data privacy
- [x] Optimization: disabled production sourcemaps to clean up build logs
- [x] SEO: Added `lang="th"` to HTML attributes
- [x] **Smart Logic**: Implemented ER fallback (214) and Ward constant (213) in `useDfCalculator.ts`
- [x] **UI Hierarchy**: Grouped results by Date with per-group Copy buttons
- [x] Data Management: Centralized `wiset-doctor-fee-rates.csv` in `assets/data/`
- [x] Verify dev server runs (<http://localhost:3000>)
- [x] Copy docs/implementation-plan.md and docs/project-status.md to project
- [x] First deployment to **Vercel** successful
- [x] **Excel Parser Fix**: Resolved issue where native `Date` objects from `read-excel-file` caused parsing failures
- [x] **Debug Logging**: Added comprehensive `console.debug` telemetry to `useExcelParser.ts` for easier troubleshooting
- [x] **Ward Logic Fix**: Corrected same-day admission exclusion window (08:00-16:00) to accurately separate ER from Ward cases
- [x] **Excel v9 Migration**: Upgraded to `read-excel-file` v9.0.6 and fixed API regressions
- [x] **1899 Time Fix**: Resolved Excel historical timezone shift (6:42h) by using UTC extraction for time components
- [x] **Smart Revenue 2.0**: Implemented daily-based shift calculation (3 shifts per day) for accurate salary estimation (1,200 min/shift)
- [x] **TypeScript Cleanup**: Resolved all strict mode "undefined" errors in composables

---

## Pending / Next Steps

- [x] Test with fixture CSV files in browser
- [x] Verify Ward 08:00-16:00 exclusion rule
- [x] Verify ER doctor filtering works correctly for mixed data
- [ ] Get full ICD-10 → Billing Code master mapping from user
- [x] Refactor ER results to use aggregated claim text (Smart Copy)
- [x] Move Ward revenue summary to be per-day
- [x] Implement Executive Dashboard (3-card summary)
- [x] Implement Smart Revenue Logic (including 1,200 min in totals)
- [ ] Polish UI micro-animations
- [ ] Add error handling edge cases

---

## Key Decisions Log

| Date       | Decision                                              | Rationale                                                                 |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| 2026-04-06 | Column indices hardcoded as constants                 | CSV has no headers; indices stable per hospital system                    |
| 2026-04-06 | Doctor filtering required for ER (real data is mixed) | ER fixture was pre-filtered, Ward fixture shows real-world mixed data     |
| 2026-04-06 | csv-parse & read-excel-file                           | Switched from SheetJS to secure parsers                                   |
| 2026-04-06 | Plan files stored in `docs/`                          | Context anchor accessible across AI model switches                        |
| 2026-04-06 | Used @primeuix/themes instead of @primevue/themes     | The latter is deprecated                                                  |
| 2026-04-06 | Native select instead of PrimeVue Dropdown            | Better reliability with Thai character names                              |
| 2026-04-06 | CSV read as UTF-8 text before parsing                 | Ensure Thai characters aren't corrupted (mojibake)                        |
| 2026-04-07 | Upgrade Nuxt 3 → 4, Tailwind v3 → v4                  | Use latest stack; Tailwind v4 CSS-first config removes tailwind.config.ts |
| 2026-04-07 | Graphite Dark Mode & CSS Masking Icons                | Professional aesthetic, better performance, and easier color management   |
| 2026-04-07 | VSCode tailwind-data.json fix                         | Resolution for 'Unknown at rule @theme' linting errors                    |
| 2026-04-07 | ESLint Flat Config & @nuxt/eslint                     | Future-proof linting for Nuxt 4 SFCs and TypeScript                       |
| 2026-04-07 | GitHub Actions (CI) on push/PR                        | Ensure code quality and build stability before merging                    |
| 2026-04-07 | Vercel Analytics & Speed Insights via Modules         | Official integration for performance tracking and user analytics          |
| 2026-04-07 | SSR: false (Pure SPA)                                 | Hospital data privacy (no server processing) and faster interactions      |
| 2026-04-07 | Disabled Build Sourcemaps                             | Fix Tailwind v4 Vite plugin warnings and reduce build size                |
| 2026-04-07 | Native Date Object Support in Excel Parser            | `read-excel-file` auto-converts dates; now handled in `parseDate`         |
| 2026-04-07 | Comprehensive Parser Telemetry                        | Console logging for every step (header/data detection) to aid debugging   |

---

## Tech Stack Versions

| Package           | Version |
| ----------------- | ------- |
| Nuxt              | 4.4.2   |
| Vue               | 3.5.33  |
| pnpm              | 10.33.0 |
| Node.js           | 22.x    |
| PrimeVue          | 4.5.5   |
| @primeuix/themes  | 2.0.3   |
| Tailwind CSS      | 4.2.4   |
| @tailwindcss/vite | 4.2.4   |
| @nuxt/eslint      | 1.0.1   |
| csv-parse         | 6.2.1   |
| read-excel-file   | 9.0.6   |
| date-fns          | 4.1.0   |
| typescript        | 6.0.3   |
| vue-router        | 5.0.6   |
