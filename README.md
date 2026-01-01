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

### 1. Clone and install

```bash
cd GitFlowAI

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your API keys (not required for the health check).

### 3. Run the backend

```bash
cd backend
npm run dev
```

The API starts at **http://localhost:5000**.

### 4. Run the frontend (in a separate terminal)

```bash
cd frontend
npm run dev
```

The application opens at **http://localhost:5173**.

### 5. Verify health

- **API health:** `GET http://localhost:5000/api/health`
- **Frontend:** Open http://localhost:5173 and click the "Check Health" button.

---

## Docker

```bash
# Build and start all services
docker compose up --build

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

---

## Available Scripts

### Backend

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start with hot-reload (nodemon)    |
| `npm start`       | Start in production                |

### Frontend

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start Vite dev server              |
| `npm run build`   | Build for production               |
| `npm run preview` | Preview production build           |

---

## API Endpoints

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| GET    | `/`             | Welcome message     |
| GET    | `/api/health`   | Server health check |

---

## License

MIT
