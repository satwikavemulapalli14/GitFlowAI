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
│  │  │ - Home   │  │ - Health │  │ w/       │  │  Router) │    │  │
│  │  │ - Login  │  │   Check  │  │ Intercep-│  │          │    │  │
│  │  │ - PRs    │  │ - Layout │  │ tors     │  │          │    │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                          HTTP (REST API)
                          ┌──────┴──────┐
                          │  Vite Proxy  │  (Dev)
                          │  /api → :5000│
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
│  │  │- /auth   │  │  Controller│ │  Handler │  │  loader  │    │  │
│  │  │- /reviews│  │- auth    │  │- Auth    │  │- DB      │    │  │
│  │  └──────────┘  │  Controller│ │ (JWT)   │  │  config  │    │  │
│  │                └──────────┘  │- Rate    │  └──────────┘    │  │
│  │                              │  Limiter │                   │  │
│  │  ┌──────────────────────┐    │- Logger  │                   │  │
│  │  │     Services         │    │  (Morgan)│                   │  │
│  │  │ - authService        │    └──────────┘                   │  │
│  │  │ - reviewService      │                                    │  │
│  │  │ - openaiService      │                                    │  │
│  │  └──────────────────────┘                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│     PostgreSQL      │  │   GitHub OAuth      │  │   OpenAI API        │
│                     │  │                     │  │                     │
│  ┌───────────────┐  │  │  - User login       │  │  - GPT-4o model     │
│  │  users        │  │  │  - Token exchange    │  │  - PR diff analysis │
│  ├───────────────┤  │  │  - Webhook events    │  │  - Code review      │
│  │  reviews      │  │  └─────────────────────┘  │    generation       │
│  ├───────────────┤  │                           └─────────────────────┘
│  │  repositories │  │
│  └───────────────┘  │
└─────────────────────┘
```

---

## Layer Summary

### 1. Client Layer (Frontend)

| Component | Responsibility |
|-----------|----------------|
| **Pages** | Route-level components (`/`, `/login`, `/prs/:id`) that compose UI from child components |
| **Components** | Reusable, single-responsibility UI blocks (`HealthCheck`, `Layout`, `PRCard`, `ReviewPanel`) |
| **Axios Instance** | Pre-configured HTTP client with base URL, auth token injection, and 401 redirect |
| **React Router** | Client-side routing with lazy-loaded routes |

**Tech:** React 18, Vite 5, Tailwind CSS 3, Axios 1.7

### 2. API Layer (Backend)

| Layer | Responsibility |
|-------|----------------|
| **Routes** | URL path definitions; delegate to controllers |
| **Controllers** | Parse request, call services, format HTTP response |
| **Services** | Business logic (auth, review generation, OpenAI calls) |
| **Middleware** | Cross-cutting concerns (auth, error handling, logging, rate limiting) |
| **Config** | Centralised environment variable loader with sensible defaults |

**Tech:** Node.js, Express 4, Morgan (logging), Helmet (security headers), CORS

### 3. Data Layer

| Store | Purpose |
|-------|---------|
| **PostgreSQL** | Persistent storage for users, repositories, and review results |
| **GitHub OAuth** | Third-party authentication and PR data source |
| **OpenAI API** | AI model for generating pull request reviews |

---

## Request Flow (Example: Health Check)

```
Browser                          Vite Dev Server           Express API
  │                                    │                       │
  │  GET /api/health                   │                       │
  │ ─────────────────────────────────► │                       │
  │                                    │  Proxy to :5000       │
  │                                    │ ────────────────────► │
  │                                    │                       │
  │                                    │  healthController     │
  │                                    │  getHealth()          │
  │                                    │    ├─ process.uptime()│
  │                                    │    ├─ os.platform()   │
  │                                    │    └─ memoryUsage()   │
  │                                    │                       │
  │  ◄─────────────────────────────────│  JSON 200 OK          │
  │  ◄─────────────────────────────────│  {success, data}      │
  │                                    │                       │
```

---

## Directory Structure

```
GitFlowAI/
│
├── frontend/                        # React SPA
│   ├── public/
│   │   └── vite.svg                 # App favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance + interceptors
│   │   ├── components/              # Reusable UI components
│   │   │   ├── HealthCheck.jsx      # Health status display
│   │   │   └── Layout.jsx           # App shell (header/footer)
│   │   ├── pages/                   # Route-level components
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # GitHub OAuth login
│   │   │   └── PRDetails.jsx        # Single PR review view
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useAuth.js           # Auth state management
│   │   ├── context/                 # React context providers
│   │   │   └── AuthContext.jsx      # Auth state context
│   │   ├── App.jsx                  # Router setup
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind directives
│   ├── index.html
│   ├── vite.config.js               # Vite config + API proxy
│   ├── tailwind.config.js           # Tailwind theme
│   └── postcss.config.js            # PostCSS plugins
│
├── backend/                         # Express REST API
│   └── src/
│       ├── config/
│       │   └── index.js             # Env configuration loader
│       ├── controllers/
│       │   ├── healthController.js  # GET /api/health
│       │   ├── authController.js    # GitHub OAuth handlers
│       │   └── reviewController.js  # PR review handlers
│       ├── routes/
│       │   ├── index.js             # Route aggregator
│       │   ├── healthRoutes.js      # Health check routes
│       │   ├── authRoutes.js        # Authentication routes
│       │   └── reviewRoutes.js      # Review routes
│       ├── services/
│       │   ├── authService.js       # GitHub OAuth logic
│       │   ├── reviewService.js     # PR review orchestration
│       │   └── openaiService.js     # OpenAI API client
│       ├── models/                  # Database models (Sequelize)
│       │   ├── User.js
│       │   ├── Repository.js
│       │   └── Review.js
│       ├── middlewares/
│       │   ├── errorHandler.js      # Central error handler
│       │   ├── auth.js              # JWT verification
│       │   └── rateLimiter.js       # Rate limiting
│       ├── database/
│       │   ├── connection.js        # DB connection setup
│       │   └── migrations/          # DB migrations
│       └── server.js                # Express app entry
│
├── docker-compose.yml               # Multi-service orchestration
├── Dockerfile                        # Production image
├── .gitignore
└── README.md
```

---

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Fast HMR, modern tooling, smaller bundle than CRA |
| **JavaScript (not TypeScript)** | Faster iteration for interview discussion; explicit JSDoc for clarity |
| **Express** | Minimal, well-known Node.js framework with large ecosystem |
| **PostgreSQL** | Reliable, ACID-compliant; great for structured review data |
| **Axios** | Cleaner API than fetch; interceptors for auth token injection |
| **Helmet + CORS** | Security best-practices out of the box |
| **MVC Pattern** | Separation of concerns; easy to test and extend |
| **Docker** | Consistent dev/prod environments; simple deployment |

---

## Future Considerations

- **Webhook Service** — Listen for GitHub PR events to trigger automatic reviews
- **Queue System** — (Bull/BullMQ) for processing PR reviews asynchronously
- **Caching** — Redis for caching review results and rate limit tracking
- **Testing** — Jest + Supertest for backend; Vitest + React Testing Library for frontend
- **CI/CD** — GitHub Actions for linting, testing, and deployment
- **Monitoring** — Sentry for error tracking; Prometheus + Grafana for metrics
