# GitFlowAI — Architecture

> AI-powered GitHub Pull Request Reviewer

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React SPA (Vite)                          │  │
│  │                                                              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │   Pages  │  │Componen- │  │  Axios   │  │  Router  │    │  │
│  │  │          │  │  ts      │  │ Instance │  │ (React   │    │  │
│  │  │ - Login  │  │ - UI     │  │ w/ Bearer│  │  Router) │    │  │
│  │  │ - Dash-  │  │ - Layout │  │  Intercep│  │          │    │  │
│  │  │   board  │  │          │  │ tors     │  │          │    │  │
│  │  │ - Re-    │  └──────────┘  └──────────┘  └──────────┘    │  │
│  │  │   pos    │                                                │  │
│  │  │ - PRs    │                                                │  │
│  │  │ - Re-    │                                                │  │
│  │  │   views  │                                                │  │
│  │  │ - Sett-  │                                                │  │
│  │  │   ings   │                                                │  │
│  │  └──────────┘                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                          HTTP (REST API)
                          ┌──────┴──────┐
                           │  Vite Proxy  │  (Dev)
                           │  /api → :5001│
                          └─────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Express)                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Express Server                            │  │
│  │                                                              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │  Routes  │──│Controllers│──│ Middle-  │  │  Config  │    │  │
│  │  │          │  │          │  │  wares   │  │          │    │  │
│  │  │- /health │  │- health  │  │- Error   │  │- env     │    │  │
│  │  │- /auth   │  │- auth    │  │- Auth    │  │  loader  │    │  │
│  │  │- /db     │  │- db      │  │  (JWT)   │  │- DB pool │    │  │
│  │  └──────────┘  └──────────┘  │- Logger  │  │- OAuth   │    │  │
│  │                              │- 404     │  │  config  │    │  │
│  │  ┌──────────────────────┐    │- Validate│  └──────────┘    │  │
│  │  │     Services         │    └──────────┘                   │  │
│  │  │ - authService (JWT)  │                                    │  │
│  │  │ - healthService      │                                    │  │
│  │  │ - passport (GitHub)  │                                    │  │
│  │  └──────────────────────┘                                    │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │  Models (raw SQL, no ORM)                               │ │  │
│  │  │  User - Repository - PullRequest - Review - Comment     │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                                                              │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │  Database: PostgreSQL Pool (connection.js)              │ │  │
│  │  │  Migration Runner (migrate.js)                          │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│     PostgreSQL      │  │   GitHub OAuth      │  │   OpenAI API        │
│                     │  │                     │  │                     │
│  gitflowai DB       │  │  - User login       │  │  - GPT-4o model     │
│  ┌───────────────┐  │  │  - Token exchange    │  │  - PR diff analysis │
│  │  users        │  │  └─────────────────────┘  │  - Code review      │
│  ├───────────────┤  │                           │    generation       │
│  │  repositories │  │                           └─────────────────────┘
│  ├───────────────┤  │
│  │  pull_requests│  │
│  ├───────────────┤  │
│  │  reviews      │  │
│  ├───────────────┤  │
│  │  comments     │  │
│  └───────────────┘  │
└─────────────────────┘
```

---

## Layer Summary

### 1. Client Layer (Frontend)

| Component | Files | Responsibility |
|-----------|-------|----------------|
| **Pages** | Login, Dashboard, Repositories, PullRequests, ReviewResults, Settings, Profile | Route-level views that compose UI from child components |
| **UI Components** | Button, Card, Modal, Table, Loader | Reusable, single-responsibility UI primitives with variant/size props |
| **Layout Components** | MainLayout, Navbar, Sidebar, Footer | App shell with navigation, user dropdown, responsive sidebar |
| **Axios Instance** | `api/axios.js` | Pre-configured HTTP client with Bearer token injection and 401 redirect |
| **Router** | `App.jsx` | Public route (`/login`) and authenticated routes (MainLayout wrapper) |

**Tech:** React 18, Vite 5, Tailwind CSS 3, Axios 1.7, React Router 6

### 2. API Layer (Backend)

| Layer | Files | Responsibility |
|-------|-------|----------------|
| **Routes** | `routes/*` | URL path definitions; auto-discovered by `routes/index.js` |
| **Controllers** | `controllers/*` | Parse request, call services, format HTTP response |
| **Services** | `services/*` | Business logic (JWT auth, GitHub OAuth, health check) |
| **Middleware** | `middleware/*` | Cross-cutting concerns (auth/JWT, error handling, logging, request validation) |
| **Models** | `models/*` | Raw SQL CRUD per table (no ORM); static methods on plain objects |
| **Database** | `database/*` | pg Pool wrapper; SQL migration runner |
| **Config** | `config/index.js` | Centralised env loader with sensible defaults |

**Tech:** Node.js 20, Express 4, Passport.js (GitHub OAuth), JWT, pg (node-postgres)

### 3. Data Layer

| Store | Purpose |
|-------|---------|
| **PostgreSQL** | Persistent storage for users, repositories, pull_requests, reviews, comments |
| **GitHub OAuth** | Third-party authentication via Passport.js strategy |
| **OpenAI API** | AI model for generating pull request reviews (future) |

---

## Authentication Flow

```
Browser                          Express API                  GitHub
  │                                    │                        │
  │  Click "Sign in with GitHub"       │                        │
  │ ────────────────────────────────►  │                        │
  │                                    │  302 Redirect to       │
  │  Redirect to GitHub OAuth          │  github.com/login/...  │
  │ ◄───────────────────────────────── │                        │
  │                                    │                        │
  │  User authorizes app               │                        │
  │ ─────────────────────────────────────────────────────────►  │
  │                                    │                        │
  │  GitHub callback with code         │                        │
  │ ◄─────────────────────────────────────────────────────────  │
  │                                    │                        │
  │  Callback: GET /api/auth/github/   │                        │
  │  callback?code=xxx                 │                        │
  │ ────────────────────────────────►  │                        │
  │                                    │  Exchange code for     │
  │                                    │  access token          │
  │                                    │ ───────────────────►   │
  │                                    │ ◄────────────────────  │
  │                                    │                        │
  │                                    │  Find or create user   │
  │                                    │  in PostgreSQL         │
  │                                    │                        │
  │                                    │  Generate JWT          │
  │                                    │                        │
  │  302 Redirect to frontend          │                        │
  │  /login?token=<JWT>                │                        │
  │ ◄───────────────────────────────── │                        │
  │                                    │                        │
  │  Frontend stores JWT in            │                        │
  │  localStorage                      │                        │
  │                                    │                        │
  │  Subsequent API calls include      │                        │
  │  Authorization: Bearer <JWT>      │                        │
  │ ────────────────────────────────►  │                        │
```

---

## Directory Structure

```
GitFlowAI/
│
├── frontend/                         # React SPA
│   ├── public/
│   │   └── vite.svg                  # Favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios instance + JWT interceptors
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx    # Shell: Navbar + Sidebar + Outlet + Footer
│   │   │   │   ├── Navbar.jsx        # Top bar with user dropdown
│   │   │   │   ├── Sidebar.jsx       # Collapsible side navigation
│   │   │   │   └── Footer.jsx        # Copyright footer
│   │   │   └── ui/
│   │   │       ├── Button.jsx        # 5 variants, 3 sizes
│   │   │       ├── Card.jsx          # Named slot container
│   │   │       ├── Modal.jsx         # Overlay dialog
│   │   │       ├── Table.jsx         # Sortable data table
│   │   │       └── Loader.jsx        # Inline/fullPage spinner
│   │   ├── pages/
│   │   │   ├── Login.jsx             # GitHub OAuth login + token capture
│   │   │   ├── Dashboard.jsx         # Stats + recent activity
│   │   │   ├── Repositories.jsx      # Repository list
│   │   │   ├── PullRequests.jsx      # PR management
│   │   │   ├── ReviewResults.jsx     # Review history
│   │   │   ├── Settings.jsx          # Account settings
│   │   │   └── Profile.jsx           # User profile
│   │   ├── App.jsx                   # Route definitions
│   │   ├── main.jsx                  # ReactDOM entry
│   │   └── index.css                 # Tailwind directives
│   ├── index.html
│   ├── vite.config.js                # Vite + proxy config
│   ├── tailwind.config.js            # Tailwind theme
│   └── postcss.config.js             # PostCSS plugins
│
├── backend/                          # Express REST API
│   └── src/
│       ├── config/
│       │   └── index.js              # Env config loader (DB, JWT, GitHub, OpenAI)
│       ├── controllers/
│       │   ├── healthController.js   # GET /api/health
│       │   ├── dbController.js       # GET /api/db/*
│       │   └── authController.js     # GitHub OAuth + JWT handlers
│       ├── routes/
│       │   ├── index.js              # Auto route loader
│       │   ├── healthRoutes.js       # /api/health
│       │   ├── dbRoutes.js           # /api/db (health, stats, migrate)
│       │   └── authRoutes.js         # /api/auth (github, callback, me, logout)
│       ├── services/
│       │   ├── passport.js           # GitHub OAuth strategy
│       │   ├── authService.js        # JWT sign/verify
│       │   └── healthService.js      # Health status
│       ├── middleware/
│       │   ├── auth.js               # JWT authenticate + optionalAuth
│       │   ├── errorHandler.js       # Central error handler
│       │   ├── logger.js             # Request logger
│       │   ├── notFoundHandler.js    # 404 handler
│       │   └── validate.js           # Request validation
│       ├── models/
│       │   ├── index.js              # Model exports
│       │   ├── User.js               # users table CRUD
│       │   ├── Repository.js         # repositories table CRUD
│       │   ├── PullRequest.js        # pull_requests table CRUD
│       │   ├── Review.js             # reviews table CRUD
│       │   └── Comment.js            # comments table CRUD
│       ├── database/
│       │   ├── connection.js         # pg Pool wrapper
│       │   ├── migrate.js            # Migration runner
│       │   └── migrations/
│       │       └── 001_initial_schema.sql
│       ├── utils/
│       │   └── asyncHandler.js       # Async error wrapper
│       ├── app.js                    # Express app setup
│       └── server.js                 # Entry point (listener)
│
├── package.json                      # Root workspace
├── Dockerfile                        # Multi-stage build
├── docker-compose.yml                # Service orchestration
├── architecture.md                   # This file
├── .gitignore
└── README.md
```

---

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Fast HMR, modern tooling, smaller bundle than CRA |
| **JavaScript (not TypeScript)** | Faster iteration; explicit JSDoc for clarity |
| **Express** | Minimal, well-known Node.js framework |
| **PostgreSQL + raw pg** | Full SQL control; no ORM overhead; interview-friendly |
| **Passport.js GitHub Strategy** | Mature, well-tested OAuth integration |
| **JWT (stateless auth)** | No server-side sessions; works well with REST APIs |
| **Axios** | Cleaner API than fetch; interceptor for Bearer token |
| **MVC Pattern** | Separation of concerns; easy to test and extend |
| **Auto route loader** | Zero-config route registration; drop a file, it's wired |
| **Docker** | Consistent dev/prod environments |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Welcome message |
| GET | `/api/health` | No | Health check (uptime, version) |
| GET | `/api/db` | No | DB endpoints overview |
| GET | `/api/db/health` | No | DB connectivity test |
| GET | `/api/db/stats` | No | Row counts per table |
| POST | `/api/db/migrate` | No | Run pending migrations |
| GET | `/api/auth/github` | No | Redirect to GitHub OAuth |
| GET | `/api/auth/github/callback` | No | OAuth callback (exchanges code) |
| GET | `/api/auth/me` | JWT | Current user profile |
| POST | `/api/auth/logout` | JWT | Logout confirmation |

---

## Future Considerations

- **Webhook Service** — Listen for GitHub PR events to trigger automatic reviews
- **Queue System** — (Bull/BullMQ) for processing PR reviews asynchronously
- **Caching** — Redis for caching review results and rate limit tracking
- **Testing** — Jest + Supertest for backend; Vitest + React Testing Library for frontend
- **CI/CD** — GitHub Actions for linting, testing, and deployment
- **Monitoring** — Sentry for error tracking; Prometheus + Grafana for metrics
