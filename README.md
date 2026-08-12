# MoneyTrack

A simple personal finance tracker for monthly income, daily expenses, and udhaar
(money you gave to people and money you took from them).

Built as a MERN app: **MongoDB + Express + React + Node**, with TypeScript on
both sides, Vite, Tailwind CSS, shadcn/ui components and Lucide icons.

## What it does

- Track monthly income from multiple sources
- Track expenses across 10 categories with filters and search
- See available balance (`income - expenses`) update instantly
- Track udhaar in both directions, with partial repayments and full history
- Switch between months; udhaar stays visible until it is settled
- Light and dark themes, mobile bottom navigation, desktop sidebar

Udhaar is deliberately kept out of the income and expense totals. Lending money
is not spending it and borrowing money is not earning it, so the dashboard shows
them as separate cash movement.

## Screens

| Dashboard | Udhaar detail | Mobile |
| --- | --- | --- |
| ![Dashboard](screenshots/dashboard-light.png) | ![Udhaar detail](screenshots/udhaar-detail.png) | ![Mobile dashboard](screenshots/mobile-dashboard.png) |

## Getting started

Requirements: Node 18+ and a MongoDB connection string.

```bash
# from the project root
npm run install:all
```

Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`
(the committed `.env` is already pointed at the project's Atlas cluster).

```bash
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:4000/api

The Vite dev server proxies `/api` to the Express server, so no CORS setup is
needed while developing.

### Other commands

```bash
npm run build      # type-check and build both server and client
npm run typecheck  # type-check only
npm start          # run the compiled API
```

## Project structure

```
server/
  src/
    config/       env loading and the Mongo connection
    models/       Income, Expense, Udhaar (with embedded repayments)
    controllers/  request handling per resource
    routes/       Express routers
    middleware/   zod body validation, error handling
    validation/   zod schemas
    utils/        UTC-safe date helpers, ApiError, asyncHandler
client/
  src/
    components/
      ui/         shadcn/ui primitives
      common/     shared building blocks (EmptyState, TransactionRow, ...)
      layout/     sidebar, bottom navigation, month switcher, theme toggle
      providers/  app-wide add/edit dialogs
    features/
      dashboard/  summary cards, cash flow, breakdown, recent activity
      income/     income form
      expenses/   expense form, filters, category metadata
      udhaar/     udhaar form, detail with timeline, record payment
    pages/        one component per route
    services/api/ HTTP transport and one service per resource
    hooks/        React Query hooks, month state, theme state
    utils/        money, date, calculations, transaction feed
    types/        shared TypeScript models
```

## Data model

| Collection | Fields |
| --- | --- |
| `incomes` | `amount`, `source`, `date`, `description` |
| `expenses` | `amount`, `category`, `date`, `description` |
| `udhaars` | `personName`, `type`, `originalAmount`, `remainingAmount`, `status`, `date`, `description`, `repayments[]` |

`remainingAmount` and `status` are always derived on the server from
`originalAmount` minus the repayment history, so they cannot drift out of sync.
Status is `PENDING` with no repayments, `PARTIALLY_PAID` while something is
outstanding, and `SETTLED` once the remainder reaches zero.

Calendar dates are stored at UTC midnight and sent as `YYYY-MM-DD`, so a record
never slips into a neighbouring day or month because of a timezone.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service and database status |
| `GET` | `/api/income` | List income (`?month=`, `?from=`, `?to=`) |
| `POST` | `/api/income` | Create income |
| `PUT` | `/api/income/:id` | Update income |
| `DELETE` | `/api/income/:id` | Delete income |
| `GET` | `/api/expenses` | List expenses (also `?category=`) |
| `POST` | `/api/expenses` | Create expense |
| `PUT` | `/api/expenses/:id` | Update expense |
| `DELETE` | `/api/expenses/:id` | Delete expense |
| `GET` | `/api/udhaar` | List udhaar (`?type=`, `?status=`, `?search=`) |
| `GET` | `/api/udhaar/:id` | Single udhaar record |
| `POST` | `/api/udhaar` | Create udhaar |
| `PUT` | `/api/udhaar/:id` | Update udhaar |
| `DELETE` | `/api/udhaar/:id` | Delete udhaar |
| `POST` | `/api/udhaar/:id/repayments` | Record a payment |
| `DELETE` | `/api/udhaar/:id/repayments/:repaymentId` | Remove a payment entry |

Validation runs on both sides: amounts must be greater than zero, a person name
is required for udhaar, a category is required for expenses, and a repayment can
never exceed the remaining amount.
