# Workshop Manager — CLAUDE.md

## Quick Reference

| Command | Purpose |
|---------|---------|
| `make up` | Start development (Tauri + Vite HMR) |
| `make build` | Install dependencies (`yarn`) |
| `make dist` | Build distributable installer |
| `make reset` | Wipe local SQLite DB and settings |

No test suite exists. Type-check with `yarn build` (tsc + vite).

---

## Tech Stack

**Desktop shell:** Tauri 2.x (Rust backend, WebView frontend)  
**Frontend:** React 18 + TypeScript 5 + Vite 6  
**UI:** Ant Design 5 (locale: `it_IT`)  
**State:** Zustand 5 (two stores: app state + database state)  
**Database:** SQLite via `tauri-plugin-sql` (local file: `estimates.db`)  
**Calendar:** FullCalendar 6  
**Charts:** Recharts 3  
**PDF:** `@react-pdf/renderer` 4  
**Theme:** `next-themes` (dark/light toggle)  
**Package manager:** Yarn (use yarn, not npm)

---

## Project Purpose

A desktop app ("Gestionale Officina") for Italian automotive workshops. Manages customers, vehicles, repair estimates, appointments, and workshop profiles. Fully offline — all data in a local SQLite database. UI labels are in Italian.

### Key Features
- **Multi-workshop** — switch between workshops, data isolated per workshop
- **Global search** — search across customers, cars, and estimates
- **Car history** — timeline of all interventions per car with km tracking and chart
- **Detail modals** — unified detail/edit/delete views for all entities
- **Duplicate estimate** — clone an existing estimate with all its items
- **PDF export** — generate/save/preview estimate PDFs with multiple themes
- **Auto-update** — in-app update checker via `tauri-plugin-updater`
- **Mobile access** — responsive layout + LAN access via QR code from Settings
- **WhatsApp quick link** — direct link to customer's WhatsApp from contact info
- **Notes** — free text notes on customers and cars

---

## Project Structure

```
src/
  components/       # Reusable UI components, grouped by type
    forms/          # One form component per entity (Customer, Car, Estimate, …)
    buttons/        # Delete, Edit button components
    pdf/            # PDF layout components for estimate export
    dashboard/      # Charts and statistics widgets
    detail/         # Detail modal views for each entity
    inputs/         # Input field wrappers
    selects/        # Select field wrappers
    CarHistory.tsx  # Timeline + km chart for car interventions
    CustomerCars.tsx # Cars list within customer detail
    GlobalSearch.tsx # Cross-entity search overlay
    UpdateChecker.tsx # In-app auto-update component
    Paginator.tsx   # Main layout with navigation menu
  pages/            # Top-level page components (Dashboard, Estimates, Customers, …)
  modules/          # All business logic and side effects
    api.ts          # HTTP client — all CRUD calls to backend server
    state.ts        # Zustand store definitions
    hooks.ts        # Custom hooks (useScraper, useQuery, useIsMobile, useDrawerWidth)
    scraper.ts      # Wikipedia car makes/models scraper
    search.ts       # Search helpers
    store.ts        # Persistent key-value store helpers
    dates.ts        # Date formatting utilities
    pricing.ts      # Pricing calculations
    utils.ts        # Miscellaneous helpers
  types/
    database.tsx    # Entity types (Workshop, Customer, Car, Estimate, …)
    common.tsx      # App-level types
  styles/
    global.css      # Utility CSS classes (.w-50, .w-100, .text-center, …)
    full-calendar-dark.css

src-tauri/
  src/
    lib.rs          # Tauri setup + SQLite migration runner + HTTP server
    main.rs         # Entry point
    commands.rs     # IPC commands (fetch proxy for Wikipedia scraper)
  migrations/       # 9 ordered SQL migration files (001–009)
  tauri.conf.json   # App config: identifier, window size, plugins
  Cargo.toml        # Rust dependencies
```

---

## Coding Conventions

### Components
- Functional components only, no class components
- Props typed as inline interfaces or named interfaces (e.g. `EstimatesFormProps`)
- Ant Design `Form.useForm()` + `Form.useWatch()` for controlled forms
- Each form component handles exactly one entity type

### State
- Access stores with destructuring: `const { property } = useStore((state) => state)`
- DB mutations go through `modules/api.ts` HTTP calls
- Async calls use `.then()/.catch()` — no `async/await` in components

### Database
- All DB access is through the Rust backend REST API — frontend uses `modules/api.ts`
- Raw SQL lives in the Rust backend, not in the frontend
- Ant Design `message.success/error()` for user feedback after API operations

### Naming
- Components and types: `PascalCase`
- Functions, variables, stores: `camelCase`
- CSS classes: `kebab-case`
- Zustand stores: prefixed with `use` (e.g. `useStore`, `useDatabaseStore`)

### Imports
- Relative paths only — no path aliases configured
- No barrel `index.ts` re-exports; import files directly

### TypeScript
- Strict mode on (`noUnusedLocals`, `noUnusedParameters`)
- Fix all TS errors before committing — the build will fail otherwise

---

## Database Schema (migrations 001–008)

| Table | Key columns |
|-------|-------------|
| `workshops` | name, address, vat, phone, email, base_labor_cost |
| `customers` | name, address, phone, email, workshop_id |
| `makers` | name (car manufacturer) |
| `models` | name, maker_id |
| `cars` | plate, year, customer_id, maker_id, model_id, last_inspection_date |
| `estimates` | customer_id, car_id, labor_hours, labor_cost, discount, iva |
| `estimate_items` | estimate_id, description, qty, unit_price |
| `appointments` | customer_id, car_id, estimate_id, date, start_time, end_time |
| `default_estimate_items` | reusable line item templates |

Notes: `customers.notes`, `cars.notes` added in migration 009.

New schema changes → add a numbered migration file in `src-tauri/migrations/`. Never edit existing migrations.

---

## Architecture

- **Backend:** Rust HTTP server (localhost:3333) exposes REST API for all CRUD operations
- **Frontend:** React SPA calls backend via `modules/api.ts` (fetch-based HTTP client)
- Frontend does NOT call SQLite directly — all DB access goes through the Rust backend API
- The only Tauri IPC command is a fetch proxy (`commands.rs`) for the Wikipedia scraper (CORS bypass)
- Plugins in use: `sql`, `store`, `fs`, `dialog`, `http`, `opener`, `updater`, `process`

---

## Releasing

Releases are built by GitHub Actions on push to the `release` branch.

- Only Windows (NSIS `.exe`) is currently active in the matrix
- macOS and Linux build targets are commented out in `.github/workflows/main.yml`
- The action creates a GitHub release draft automatically

To cut a release: bump the version in `tauri.conf.json`, then push to `release`.

---

## Key Constraints

- **Italian locale everywhere** — UI labels, Ant Design locale (`it_IT`), dayjs locale. Keep new UI text in Italian.
- **Offline-first** — no network calls except the Wikipedia scraper. Do not introduce server dependencies.
- **SQLite only** — all persistence goes through `tauri-plugin-sql`. Do not add other storage layers.
- **Yarn only** — do not use npm or pnpm; a `yarn.lock` is committed.
- **No test suite** — validate changes manually and with `yarn build` (type-check).
