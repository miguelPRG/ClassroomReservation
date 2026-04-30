# Classroom Reservation Platform

A full‑stack web application for managing classroom reservations, built with **FastAPI + MongoDB** on the backend and a modern **React + TypeScript + Vite** SPA on the frontend.

The project is designed as a 2026‑ready showcase of clean architecture, security‑aware APIs, and a production‑oriented Docker setup for recruiters looking for a full‑stack developer.

## Features

- User management with registration, login, and role‑based access control (admin vs regular user).
- Secure authentication using **JWT** stored in HTTP‑only cookies.
- Classroom management (CRUD) with capacity and metadata.
- Reservation management with:
  - Time‑window validation and conflict detection.
  - Per‑room reservation listing with pagination.
  - Different visibility rules for admins vs regular users.
- Real‑time room availability calculation (`isFree`).
- Input validation using **Pydantic** models on the backend and **zod + react‑hook‑form** on the frontend.
- Centralized logging, rate limiting, and production‑grade CORS/proxy configuration.
- Developer‑friendly UX with a responsive dark UI, toasts, and client‑side routing.

## Tech Stack

### Backend
- **FastAPI** for building a high‑performance, async REST API with automatic OpenAPI/Swagger documentation.
- **MongoDB** (via `motor`) as the NoSQL database.
- **Pydantic** models for strict request/response validation (users, rooms, reservations).
- **JWT** authentication with signed tokens (HS512) and cookie‑based session handling.
- **Password hashing** via `pwdlib.PasswordHash`.
- **Environment management** using `.env` + `python‑dotenv`.
- **Async Mongo indexes** to enforce unique reservation constraints.
- **uv** for modern Python dependency management and reproducible environments.

### Frontend
- **React 19 + TypeScript** with **Vite** for a fast development experience.
- **React Router** for public and private routes.
- **@tanstack/react‑query** for API calls, caching, and error handling.
- **react‑hook‑form** + **zod** for type‑safe form handling and validation.
- **zustand** for lightweight global state management (e.g., current user).
- **Tailwind CSS 4 + shadcn UI** for a modern, dark‑mode‑by‑default interface.
- **react‑toastify** for user feedback and notifications.

### DevOps & Infrastructure
- **Docker** for containerizing both backend and frontend.
- **docker‑compose** to orchestrate the full stack.
- **Nginx** as a reverse proxy serving the SPA and routing `/api/*` traffic to the backend.
- Secure, non‑root containers and hardened Nginx config with OWASP‑style security headers.

## Architecture Overview

**Data Model Diagram**

<img src="/diagrama.jpeg" alt="Data Model Diagram">

The system features three core entities: **Users** (with admin/user roles), **Rooms** (with capacity and availability), and **Reservations** (with conflict detection and state management). The diagram illustrates the relationships and constraints between these entities.

The repository is split into two main apps:

```text
WebServices/
├── backend/   # FastAPI + MongoDB API
└── frontend/  # React + Vite SPA
```

**Application Interface**

<img src="/image.png" alt="Application Screenshot">

The modern dark-mode dashboard provides an intuitive interface for room management, reservation creation, and real-time availability checking, built with Tailwind CSS 4 and shadcn UI components.

### Backend responsibilities
- Exposes REST endpoints for: `/user`, `/room`, `/reservation`
- Middleware handles database init, CORS, rate limiting, JWT validation
- Production-only proxy validation via `X-Internal-Proxy` header

FastAPI automatically exposes interactive API documentation at:
- `GET /docs` – Swagger UI
- `GET /redoc` – ReDoc
- `GET /openapi.json` – raw OpenAPI schema

### Frontend responsibilities
- SPA handles authentication flows, protected routes, and forms
- React Query manages API caching and optimistic updates
- Responsive dark UI with loading states and toast notifications

## Running the project locally (without Docker)

### Prerequisites
- **Backend**: Python 3.x, MongoDB instance
- **Frontend**: Node.js 20+

### Backend Setup
```bash
cd backend
# Create .env with MONGO_URL and JWT_SECRET_KEY
pip install uv && uv sync
uv run fastapi dev main.py  # http://127.0.0.1:8000
```

### Frontend Setup
```bash
cd frontend
# Create .env with VITE_API_URL=http://127.0.0.1:8000
npm install && npm run dev  # http://127.0.0.1:5173
```

## Running with Docker (Recommended)

```bash
docker compose up --build
```

Access the full stack at `http://localhost:8080` (frontend + proxied API).

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/user/register` | POST | Public | Create user (strong password validation) |
| `/user/login` | POST | Public | JWT login (HTTP-only cookie) |
| `/room/` | POST/GET | Admin/User | Room CRUD + paginated list |
| `/reservation/` | POST | User | Create reservation (1-day min lead time) |
| `/reservation/room/{id}` | GET | User | Room reservations (role-based filtering) |

## Security Features
- JWT tokens with 1h expiry in HTTP-only cookies
- Rate limiting (15 req/30s per IP)
- Admin-only room CRUD operations
- Production CORS + proxy validation
- Nginx OWASP headers (XSS, clickjacking protection)

This 2026-ready full-stack project demonstrates production-grade full-stack development with modern tooling, security best practices, and containerized deployment.
