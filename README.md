# GitFlowAI

> **AI-powered GitHub Pull Request Reviewer**

GitFlowAI automatically reviews pull requests using OpenAI, providing actionable feedback on code quality, security, and best practices. Built with a clean MVC architecture for maintainability and scale.

---

## Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios 1.7  |
| **Backend**  | Node.js, Express 4, Helmet, Morgan, CORS, Dotenv              |
| **Database** | PostgreSQL 16                                                 |
| **Auth**     | JWT + GitHub OAuth                                            |
| **AI**       | OpenAI API (GPT-4o)                                           |
| **DevOps**   | Docker, Docker Compose, npm workspaces                        |

---

## Complete File Reference

### Root

| File | Purpose |
|------|---------|
| `package.json` | Root npm workspace — single `npm install` installs both apps |
| `.gitignore` | Ignores `node_modules/`, `.env`, build output, IDE files |
| `README.md` | Project documentation |
| `architecture.md` | System architecture diagram, layer breakdown, request flow |
| `Dockerfile` | Multi-stage production image — builds frontend, serves via Express |
| `docker-compose.yml` | Orchestrates backend + PostgreSQL services |

### Backend — `backend/`

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: express, cors, helmet, morgan, dotenv, nodemon |
| `.env.example` | Template for all environment variables |

#### `backend/src/`

| File | Purpose |
|------|---------|
| `app.js` | Express app factory — configures middleware stack and registers routes |
| `server.js` | Entry point — imports app, starts listener |

#### `backend/src/config/`

| File | Purpose |
|------|---------|
| `index.js` | Loads `.env` via dotenv, exports typed config object (port, JWT, GitHub OAuth, OpenAI) |

#### `backend/src/controllers/`

| File | Purpose |
|------|---------|
| `healthController.js` | `getHealth()` — returns status, version |
| `dbController.js` | `getHealth()`, `getStats()`, `runMigrations()` — database endpoints |
| `authController.js` | `githubCallback()`, `me()`, `logout()` — GitHub OAuth + JWT handlers |

#### `backend/src/routes/`

| File | Purpose |
|------|---------|
| `healthRoutes.js` | `GET /api/health` → healthController |
| `dbRoutes.js` | `GET /api/db/*` → dbController (health, stats, migrate) |
| `authRoutes.js` | `GET /api/auth/*` → authController (github, callback, me, logout) |
| `index.js` | Auto-loader — discovers route modules and registers them |

#### `backend/src/database/`

| File | Purpose |
|------|---------|
| `connection.js` | PostgreSQL pool — `query()`, `getClient()`, `testConnection()` |
| `migrate.js` | Migration runner — reads and applies `.sql` files in order |

#### `backend/src/database/migrations/`

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Creates 5 tables (users, repositories, pull_requests, reviews, comments), indexes, foreign keys, and `updated_at` auto-trigger |

#### `backend/src/models/`

| File | Purpose |
|------|---------|
| `index.js` | Central export for all models |
| `User.js` | CRUD for `users` — `findByGithubId()`, `findByUsername()`, `create()`, `update()`, `delete()` |
| `Repository.js` | CRUD for `repositories` — `findByOwner()`, `findByFullName()`, `countByOwner()` |
| `PullRequest.js` | CRUD for `pull_requests` — `findByRepository()`, `findByState()`, `findByRepoAndNumber()` |
| `Review.js` | CRUD for `reviews` — `findByPullRequest()`, `findByReviewer()`, `averageScore()` |
| `Comment.js` | CRUD for `comments` — `findByReview()`, `findByFile()`, `countBySeverity()` |

#### `backend/src/middleware/`

| File | Purpose |
|------|---------|
| `auth.js` | `authenticate()` — verifies JWT Bearer token, attaches `req.user`; `optionalAuth()` — same but non-fatal |
| `errorHandler.js` | Catches all errors, returns `{ success, message, stack }` JSON |
| `notFoundHandler.js` | Returns 404 JSON for unmatched routes |
| `logger.js` | Custom request logger with timestamp and duration |
| `validate.js` | Request body/query/params validation against a schema |

#### `backend/src/services/`

| File | Purpose |
|------|---------|
| `healthService.js` | `getHealth()` — returns `{ status: 'OK', version }` from package.json |
| `authService.js` | `generateToken(user)` — signs JWT with user payload; `verifyToken(token)` — validates and decodes |
| `passport.js` | GitHub OAuth strategy — configures Passport with `passport-github2`, upserts user on auth |

#### `backend/src/utils/`

| File | Purpose |
|------|---------|
| `asyncHandler.js` | Wraps async route handlers, forwards rejected promises to Express error handler |

#### Middleware stack order (in `app.js`):

```
helmet → cors → bodyParser → morgan (dev) → logger → passport.initialize() → routes → notFoundHandler → errorHandler
```

### Frontend — `frontend/`

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: react, react-dom, react-router-dom, axios, vite, tailwindcss |
| `index.html` | HTML shell with `<div id="root">`, Tailwind body classes |
| `vite.config.js` | Dev server on port 5173, proxies `/api` → `localhost:5001` |
| `tailwind.config.js` | Custom `primary` color palette (blue scale) |
| `postcss.config.js` | Tailwind CSS + Autoprefixer plugins |

#### `frontend/public/`

| File | Purpose |
|------|---------|
| `vite.svg` | Favicon — gradient "G" logo |

#### `frontend/src/`

| File | Purpose |
|------|---------|
| `main.jsx` | ReactDOM entry — wraps App in `<BrowserRouter>` |
| `App.jsx` | Route definitions — public (Login) and authenticated (MainLayout) routes |
| `index.css` | Tailwind directives + custom utility classes |

#### `frontend/src/api/`

| File | Purpose |
|------|---------|
| `axios.js` | Pre-configured Axios instance — base URL `/api`, 15s timeout, JWT token injection via request interceptor, 401 redirect via response interceptor |

#### `frontend/src/components/layout/`

| File | Purpose |
|------|---------|
| `MainLayout.jsx` | App shell — composes Navbar, Sidebar, `<Outlet />`, and Footer |
| `Navbar.jsx` | Top navigation bar with mobile hamburger toggle and user dropdown |
| `Sidebar.jsx` | Collapsible side navigation with icons, active link highlighting, mobile overlay |
| `Footer.jsx` | Simple footer with copyright and quick links |

#### `frontend/src/components/ui/`

| File | Purpose |
|------|---------|
| `Button.jsx` | Reusable button — variants (primary/secondary/outline/ghost/danger), sizes (sm/md/lg), loading spinner |
| `Card.jsx` | Card container with `CardHeader`, `CardTitle`, `CardBody` named exports |
| `Modal.jsx` | Modal dialog with overlay, close button, header/body/footer sections |
| `Table.jsx` | Data table with sortable columns, custom cell rendering, empty state |
| `Loader.jsx` | Loading spinner — inline and fullPage variants |

#### `frontend/src/pages/`

| File | Purpose |
|------|---------|
| `Login.jsx` | Login page — centered card, GitHub sign-in button, guest link |
| `Dashboard.jsx` | Dashboard — stats cards (Total/Open/Reviewed/Pending PRs), recent activity table |
| `Repositories.jsx` | Repository list — search filter, sortable table, add button |
| `PullRequests.jsx` | PR management — status filter tabs, PR cards with review/view actions |
| `ReviewResults.jsx` | Review results — summary stats, sortable reviews table |
| `Settings.jsx` | Settings — profile, notification, and API key sections with save |
| `Profile.jsx` | User profile — avatar, stats grid, recent activity list |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** 16 — required for database features
- **Docker Desktop** — optional, for containerised deployment

### 1. Clone and install

```bash
git clone https://github.com/satwikavemulapalli14/GitFlowAI.git
cd GitFlowAI
npm install
```

> A single `npm install` at the root installs dependencies for both `frontend/` and `backend/` via npm workspaces.

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your own values. Database connection will use the `DATABASE_URL` value. By default, it connects as the `postgres` user via local socket (no password required on macOS Homebrew installs).

### 3. Create the database

```bash
createdb gitflowai
```

Alternatively, connect via psql and run `CREATE DATABASE gitflowai;`.

### 4. Run migrations

```bash
node backend/src/database/migrate.js
```

This creates all 5 tables (`users`, `repositories`, `pull_requests`, `reviews`, `comments`), indexes, foreign keys, and the auto-updated_at trigger.

### 5. Run both servers

```bash
npm run dev
```

This starts both servers concurrently:

| Server   | URL                         |
|----------|-----------------------------|
| Backend  | `http://localhost:5001`     |
| Frontend | `http://localhost:5173`     |

### 6. Verify

- **API:** `curl http://localhost:5001/api/health`
- **Frontend:** Open `http://localhost:5173` and sign in with GitHub
- **DB Health:** `curl http://localhost:5001/api/db/health`

### Expected API response

```json
{
  "status": "OK",
  "version": "1.0.0"
}
```

---

## Available Scripts

All commands run from the **root** directory.

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies (both apps) |
| `npm run dev` | Start backend + frontend concurrently |
| `npm run build` | Build frontend for production |
| `npm start` | Start backend in production mode |

### Per-workspace commands

```bash
npm run dev -w backend        # Backend only (nodemon)
npm run dev -w frontend       # Frontend only (Vite)
npm run build -w frontend     # Build frontend only
npm run start -w backend      # Start backend only
```

---

## API Endpoints

| Method | Path | Auth | Description | Response |
|--------|------|------|-------------|----------|
| `GET` | `/` | No | Welcome message | `{ success, message, version }` |
| `GET` | `/api/health` | No | Server health check | `{ status: "OK", version }` |
| `GET` | `/api/db/health` | No | Database connectivity test | `{ success, data: { connected, latencyMs, version } }` |
| `GET` | `/api/db/stats` | No | Row counts per table | `{ success, data: { tables, total } }` |
| `POST` | `/api/db/migrate` | No | Run pending migrations | `{ success, message, data: { applied } }` |
| `GET` | `/api/auth/github` | No | Redirect to GitHub OAuth | 302 → github.com |
| `GET` | `/api/auth/github/callback` | No | OAuth callback, returns JWT | 302 → frontend with `?token=` |
| `GET` | `/api/auth/me` | JWT | Current user profile | `{ success, data: { id, username, email, ... } }` |
| `POST` | `/api/auth/logout` | JWT | Logout confirmation | `{ success, message }` |
| `GET` | `/*` | No | Unknown route | `404 { success: false, message }` |

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `5001` | No | Backend server port |
| `NODE_ENV` | `development` | No | Environment mode |
| `DATABASE_URL` | `postgresql://postgres@localhost:5432/gitflowai` | Yes | PostgreSQL connection string |
| `DB_POOL_MAX` | `10` | No | Max database pool connections |
| `JWT_SECRET` | — | Yes | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | No | JWT token expiry |
| `GITHUB_CLIENT_ID` | — | Yes (for auth) | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | — | Yes (for auth) | GitHub OAuth app secret |
| `GITHUB_CALLBACK_URL` | `http://localhost:5001/api/auth/github/callback` | Yes (for auth) | OAuth callback URL |
| `OPENAI_API_KEY` | — | Future | OpenAI API key |

---

## Docker

### Build and run

```bash
docker compose up --build
```

| Service   | URL                     |
|-----------|-------------------------|
| Backend   | `http://localhost:5001` |
| Database  | `localhost:5432`        |

### Production image

The `Dockerfile` uses a multi-stage build:

1. **frontend-build** — installs frontend deps, runs `vite build` → `frontend/dist/`
2. **backend** — installs backend production deps only
3. **final** — copies backend and built frontend, serves via Express on port 5001

```bash
docker build -t gitflowai .
docker run -p 5001:5001 gitflowai
```

---

## GitHub OAuth Setup

To enable GitHub authentication, create a GitHub OAuth App:

1. Go to **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** `GitFlowAI (Dev)`
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:5001/api/auth/github/callback`
3. Click **Register application**
4. Copy the **Client ID** and **Client Secret** into `backend/.env`:

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

---

## Project Structure

```
GitFlowAI/
│
├── frontend/                         # React SPA
│   ├── public/
│   │   └── vite.svg                  # Favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios instance + interceptors
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx    # Shell: Navbar + Sidebar + Outlet + Footer
│   │   │   │   ├── Navbar.jsx        # Top bar with user dropdown
│   │   │   │   ├── Sidebar.jsx       # Side navigation with icons
│   │   │   │   └── Footer.jsx        # Copyright footer
│   │   │   └── ui/
│   │   │       ├── Button.jsx        # Reusable button with variants
│   │   │       ├── Card.jsx          # Card container with named slots
│   │   │       ├── Modal.jsx         # Modal dialog with overlay
│   │   │       ├── Table.jsx         # Sortable data table
│   │   │       └── Loader.jsx        # Loading spinner
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login with GitHub OAuth
│   │   │   ├── Dashboard.jsx         # Stats + recent activity
│   │   │   ├── Repositories.jsx      # Repository list with search
│   │   │   ├── PullRequests.jsx      # PR management with filters
│   │   │   ├── ReviewResults.jsx     # Review summary and history
│   │   │   ├── Settings.jsx          # Account settings sections
│   │   │   └── Profile.jsx           # User profile and stats
│   │   ├── App.jsx                   # Route definitions
│   │   ├── main.jsx                  # ReactDOM entry point
│   │   └── index.css                 # Tailwind directives
│   ├── index.html
│   ├── vite.config.js                # Vite + proxy config
│   ├── tailwind.config.js            # Tailwind theme
│   └── postcss.config.js             # PostCSS plugins
│
├── backend/                          # Express REST API
│   └── src/
│       ├── config/
│       │   └── index.js              # Env config loader
│       ├── controllers/
│       │   ├── healthController.js   # Health check handler
│       │   └── dbController.js       # DB health / stats / migrate
│       ├── routes/
│       │   ├── healthRoutes.js       # /api/health route
│       │   ├── dbRoutes.js           # /api/db routes
│       │   └── index.js              # Auto route loader
│       ├── middleware/
│       │   ├── errorHandler.js       # Central error handler
│       │   ├── logger.js             # Request logger
│       │   ├── notFoundHandler.js    # 404 handler
│       │   └── validate.js           # Request validation
│       ├── database/
│       │   ├── connection.js         # PostgreSQL pool
│       │   ├── migrate.js            # Migration runner
│       │   └── migrations/
│       │       └── 001_initial_schema.sql
│       ├── models/
│       │   ├── index.js              # Model exports
│       │   ├── User.js
│       │   ├── Repository.js
│       │   ├── PullRequest.js
│       │   ├── Review.js
│       │   └── Comment.js
│       ├── utils/
│       │   └── asyncHandler.js       # Async error wrapper
│       ├── app.js                    # Express app setup
│       └── server.js                 # Entry point (listener)
│
├── package.json                      # Root workspace
├── Dockerfile                        # Multi-stage build
├── docker-compose.yml                # Service orchestration
├── architecture.md                   # System architecture
├── .gitignore
└── README.md
```

---

## Architecture Summary

The application follows **MVC architecture** with a clear separation of concerns:

```
Browser → Vite Proxy → Express Router → Controller → JSON Response
                           │
                     [Middleware Stack]
                  helmet → cors → bodyParser → morgan
```

- **Frontend** is a single-page application built with React and Vite. It communicates with the backend through a Vite proxy that forwards `/api` requests during development.
- **Backend** follows the MVC pattern: Routes define URL paths, Controllers handle request/response logic, and Middleware provides cross-cutting concerns (security, logging, error handling).
- **Infrastructure** is containerised with Docker. The Dockerfile uses multi-stage builds to optimise the production image.
- **Workspace monorepo** uses npm workspaces so a single `npm install` at the root installs everything.

See [`architecture.md`](./architecture.md) for the full architecture diagram, request flow, layer breakdown, technology decisions, and future roadmap.

---

## Git History

```
2026-01-05  Add root workspace for single-command install and dev
2026-01-01  Update README with comprehensive documentation
2025-12-29  Document system architecture and design decisions
2025-12-25  Add Docker and docker-compose deployment
2025-12-22  Build Home page and HealthCheck component
2025-12-18  Set up Axios HTTP client with interceptors
2025-12-15  Configure Tailwind CSS and PostCSS
2025-12-11  Initialize React frontend with Vite
2025-12-08  Implement health check API endpoint
2025-12-04  Set up Express server with middleware stack
2025-12-01  Initialize project structure and configuration files
```

---

## License

MIT
