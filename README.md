# GitFlowAI

**AI-powered GitHub Pull Request Reviewer.**

GitFlowAI automatically reviews pull requests using OpenAI, providing actionable feedback on code quality, security, and best practices.

---

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Frontend   | React, Vite, Tailwind CSS, Axios  |
| Backend    | Node.js, Express.js                |
| Database   | PostgreSQL                         |
| Auth       | JWT + GitHub OAuth                 |
| AI         | OpenAI API                         |
| Deployment | Docker / docker-compose            |

---

## Project Structure

```
GitFlowAI/
├── frontend/                # React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── api/axios.js     # Axios instance with interceptors
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Tailwind directives
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/                 # Express REST API
│   └── src/
│       ├── config/          # Environment configuration
│       ├── controllers/     # Request handlers
│       ├── routes/          # Express route definitions
│       ├── middlewares/     # Custom middleware
│       └── server.js        # Entry point
├── package.json             # Root workspace config
├── docker-compose.yml
├── Dockerfile
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL (optional – only needed when adding DB features)
- Docker & Docker Compose (optional – for containerised deployment)

### 1. Install (single command)

```bash
cd GitFlowAI
npm install
```

This installs dependencies for both frontend and backend via npm workspaces.

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your API keys (not required for the health check).

### 3. Run both servers (single command)

```bash
npm run dev
```

This starts the backend (port 5001) and frontend (port 5173) concurrently.

### 5. Verify health

- **API health:** `GET http://localhost:5001/api/health`
- **Frontend:** Open http://localhost:5173 and click the "Check Health" button.

---

## Docker

```bash
# Build and start all services
docker compose up --build

# Backend: http://localhost:5001
# Frontend: http://localhost:3000
```

---

## Available Scripts

Run all commands from the **root** directory.

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm install`     | Install all dependencies (both apps)           |
| `npm run dev`     | Start both backend + frontend concurrently     |
| `npm run build`   | Build frontend for production                  |
| `npm start`       | Start backend in production mode               |

### Per-workspace commands

```bash
npm run dev -w backend    # Backend only
npm run dev -w frontend   # Frontend only
npm run build -w frontend # Build frontend only
```

---

## API Endpoints

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| GET    | `/`             | Welcome message     |
| GET    | `/api/health`   | Server health check |

---

## License

MIT
