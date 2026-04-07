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

---

## Project Structure

```
src/
  components/       # Reusable UI components, grouped by type
    forms/          # One form component per entity (Customer, Car, Estimate, …)
    buttons/        # Delete, Edit button components
    pdf/            # PDF layout components for estimate export
    dashboard/      # Charts and statistics widgets
    dropdowns/      # Dropdown/select wrappers
    inputs/         # Input field wrappers
    selects/        # Select field wrappers
    tours/          # Onboarding tour components
  pages/            # Top-level page components (Dashboard, Estimates, Customers, …)
  modules/          # All business logic and side effects
    state.ts        # Zustand store definitions
    database.ts     # Generic CRUD helpers (create/update/delete/select)
    queries.ts      # Complex SQL queries with joins
    hooks.ts        # Custom hooks (useScraper, useTour)
    scraper.ts      # Wikipedia car makes/models scraper
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
    lib.rs          # Tauri setup + SQLite migration runner
    main.rs         # Entry point
    commands.rs     # IPC commands (fetch proxy for Wikipedia scraper)
  migrations/       # 8 ordered SQL migration files (001–008)
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
- DB mutations go through `modules/database.ts` helpers, then update Zustand state
- Async DB calls use `.then()/.catch()` — no `async/await` in components

### Database
- All raw SQL lives in `modules/database.ts` (generic CRUD) or `modules/queries.ts` (complex joins)
- Always use parameterized queries — never string-interpolate user values into SQL
- Ant Design `message.success/error()` for user feedback after DB operations

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

New schema changes → add a numbered migration file in `src-tauri/migrations/`. Never edit existing migrations.

---

## Tauri IPC

- Frontend calls Rust via `invoke("command_name", { args })` from `@tauri-apps/api/core`
- The only custom command is a fetch proxy (`commands.rs`) used by the Wikipedia scraper to bypass CORS
- Plugins in use: `sql`, `store`, `fs`, `dialog`, `http`, `opener`

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
