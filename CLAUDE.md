# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start Django backend + Vite frontend concurrently
npm run dev:frontend     # Start Vite dev server only (port 3000)
npm run dev:debug        # Start both with Vite --mode debug
npm run build            # Production build (vite build)
npm run lint             # Type-check only (tsc --noEmit)
npm run preview          # Preview production build
npm run clean            # Remove dist/
```

`npm run dev` spawns the Django backend from `ORIGIN_DJANGO_PATH` (defaults to `C:\Users\Haruta\Documents\code\python\origin_django`) and the Vite frontend concurrently. Both processes share stdout/stderr with labels. Either process exiting terminates the other.

## Architecture

**Stack**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4 (via `@tailwindcss/vite`), React Router 7, Recharts 3, Motion (Framer Motion successor, `motion/react`)

**Backend**: Django REST API at `http://127.0.0.1:8000/api`. All API calls flow through the generic `requestJson<T>()` client (`src/api/client.ts`), which expects `{ code: 0, message: "...", data: ... }` response shape and unwraps `data`.

### Routing

React Router 7 with `BrowserRouter`. All pages sit inside `MainLayout` (sidebar + header + content).

| Path | Page |
|------|------|
| `/` | DashboardPage |
| `/products` | ProductManagementPage |
| `/inventory-status` | InventoryStatusPage |
| `/analysis` | AnalyticsPage |
| `/settings` | SettingsPage |

### API layer (`src/api/`)

Each API file exports DTO types and functions that call `requestJson<T>()`:

- **`client.ts`** — `requestJson<T>(path, options)` builds URL from `VITE_API_BASE_URL`, attaches `VITE_API_TOKEN` as Bearer auth, handles JSON serialization, and throws `ApiClientError` on non-ok responses. Always expects `{ data: T }` envelope.
- **`products.ts`** — Full CRUD for products + category listing. Converts DTOs to UI `Product` type via `toProduct()`. Posts to `/products`, patches via `/products/:id`.
- **`batches.ts`** — Batch listing, creation, expiry alerts. Posts to `/batches`.
- **`inventory.ts`** — Pure functions that transform `BatchDto` into UI-facing types (`InventoryRecord`, `InventoryBatchDetail`, `InventoryRelatedBatch`). Shelf-life math (`getShelfLifeMetricsFromDates`, `getShelfLifeMetricsFromBatch`). Temperature metadata derived from Chinese location keywords.
- **`types.ts`** — Shared response/pagination types and `ApiClientError` class.

### Component conventions

- **UI = Chinese**: All user-facing strings, labels, placeholders, and aria-labels are in Chinese.
- **Styling**: Tailwind utility classes via `cn()` helper (`src/lib/utils.ts` — clsx + tailwind-merge). Custom theme tokens (colors, fonts) defined in `src/index.css` via `@theme` directive. The `.ambient-shadow` utility class is used for card/section elevations.
- **Animation**: Sidebar uses CSS transitions with `cubic-bezier(0.22, 1, 0.36, 1)` easing (500ms). Modals use Motion (Spring) for enter/exit with backdrop blur overlay.
- **Modals**: Pattern is `AnimatePresence` + Motion backdrop + Motion panel, with `pointer-events-none` outer and `pointer-events-auto` inner to enable click-outside-to-close. Submitting state disables close.
- **Data loading**: Pages fetch on mount with an `isLoading` flag and show centered spinner states. Errors are caught and displayed as red banners with Chinese error messages. `ApiClientError.message` is mapped to Chinese via per-page `getErrorMessage()` helpers.

### Sidebar layout

Fixed-position sidebar with animated width (80px collapsed / 256px expanded). Content area animates `margin-left` in matching fashion. `LayoutContext` provides `sidebarCollapsed` and `isSidebarAnimating` to children.

### Product ↔ Inventory relationship

Products are master data (barcode, name, manufacturer, shelf life). Batches belong to products and track individual received lots with quantities, manufacture/expiry dates. The inventory page merges batch data with product metadata via `mergeInventoryRecord()` to enrich category/location info.
