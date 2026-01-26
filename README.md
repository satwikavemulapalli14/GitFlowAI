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
| `server.js` | Express app entry — mounts middleware, routes, starts listener |

#### `backend/src/config/`

| File | Purpose |
|------|---------|
| `index.js` | Loads `.env` via dotenv, exports typed config object (port, JWT, GitHub OAuth, OpenAI) |

#### `backend/src/controllers/`

| File | Purpose |
|------|---------|
| `healthController.js` | `getHealth()` — returns uptime, memory, platform, node version |

#### `backend/src/routes/`

| File | Purpose |
|------|---------|
| `healthRoutes.js` | `GET /api/health` → healthController |

#### `backend/src/middleware/`

| File | Purpose |
|------|---------|
| `errorHandler.js` | Catches all errors, returns `{ success, message, stack }` JSON |
| `notFoundHandler.js` | Returns 404 JSON for unmatched routes |
| `logger.js` | Custom request logger with timestamp and duration |
| `validate.js` | Request body/query/params validation against a schema |

#### Middleware stack order (in `app.js`):

```
helmet → cors → bodyParser → morgan (dev) → logger → routes → notFoundHandler → errorHandler
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
- **PostgreSQL** 16 — optional, needed when database features are added
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

Edit `backend/.env` with your own values (not required for the health check to work).

### 3. Run both servers

```bash
npm run dev
```

This starts both servers concurrently:

| Server   | URL                         |
|----------|-----------------------------|
| Backend  | `http://localhost:5001`     |
| Frontend | `http://localhost:5173`     |

### 4. Verify

- **API:** `curl http://localhost:5001/api/health`
- **Frontend:** Open `http://localhost:5173` and click the **"Check Health"** button

### Expected API response

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "uptime": 2.02,
    "timestamp": "2026-07-06T07:53:23.100Z",
    "environment": "development",
    "nodeVersion": "v25.8.1",
    "platform": "darwin",
    "memoryUsage": {
      "heapUsed": "8MB",
      "heapTotal": "13MB"
    }
  }
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

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `GET` | `/` | Welcome message | `{ "message": "Welcome to GitFlowAI API" }` |
| `GET` | `/api/health` | Server health check | `{ success, message, data: { uptime, timestamp, environment, nodeVersion, platform, memoryUsage } }` |
| `GET` | `/*` | Unknown route | `404 { success: false, message }` |

---

## Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `5001` | No | Backend server port |
| `NODE_ENV` | `development` | No | Environment mode |
| `DATABASE_URL` | — | Future | PostgreSQL connection string |
| `JWT_SECRET` | — | Future | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | No | JWT token expiry |
| `GITHUB_CLIENT_ID` | — | Future | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | — | Future | GitHub OAuth app secret |
| `GITHUB_CALLBACK_URL` | — | Future | OAuth callback URL |
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
│       │   └── healthController.js   # Health check handler
│       ├── routes/
│       │   └── healthRoutes.js       # /api/health route
│       ├── middlewares/
│       │   └── errorHandler.js       # Central error handler
│       └── server.js                 # Express entry point
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
