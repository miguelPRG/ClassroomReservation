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

The repository is split into two main apps:

```text
WebServices/
├── backend/   # FastAPI + MongoDB API
└── frontend/  # React + Vite SPA
```

### Backend responsibilities

- Exposes REST endpoints for:
  - `/user` – user registration, login, logout, profile.
  - `/room` – CRUD operations on rooms (admin‑only for create/update/delete).
  - `/reservation` – reservation creation and listing.
- Uses middleware to:
  - Initialize the database connection and indexes on startup.
  - Enforce CORS rules depending on the environment.
  - Apply rate limiting per IP to mitigate brute‑force or DDoS attempts.
  - Attach the current UTC timestamp and authenticated user payload to `request.state`.
- Uses JWT tokens stored in HTTP‑only cookies for protected routes.
- In production, only allows traffic that comes through the frontend proxy (via a custom `X‑Internal‑Proxy` header).

FastAPI automatically exposes interactive API documentation at:

- `GET /docs` – Swagger UI
- `GET /redoc` – ReDoc
- `GET /openapi.json` – raw OpenAPI schema

### Frontend responsibilities

- SPA that handles authentication, protected routes, and forms.
- Talks to the backend via the `VITE_API_URL` environment variable (default `/api` in the Docker setup).
- Uses React Query for data fetching, caching, and mutation flows.
- Provides UX enhancements like loading states, toasts, and tooltips.

In production, the frontend is served by Nginx, which also proxies `/api/*` requests to the FastAPI backend.

## Running the project locally (without Docker)

You can run the backend and frontend separately during development.

### Prerequisites

- **Backend:**
  - Python (as specified in `backend/.python-version` or a recent 3.x).
  - MongoDB instance (local or remote).
- **Frontend:**
  - Node.js 20+ and npm.

### 1. Configure and run the backend

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Create a `.env` file with at least:

   ```env
   MONGO_URL=mongodb://localhost:27017
   JWT_SECRET_KEY=your-jwt-secret
   APP_ENV=development
   ```

3. Install the dependency manager and sync dependencies:

   ```bash
   pip install uv
   uv sync
   ```

4. Start the FastAPI app in development mode:

   ```bash
   uv run fastapi dev main.py
   ```

   By default, the API will be available at `http://127.0.0.1:8000`.

5. Open the auto‑generated API docs:

   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

### 2. Configure and run the frontend

1. In a new terminal, navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Create a `.env` (or `.env.local`) file defining the API base URL. For local development you can point directly to the backend:

   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

3. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. The SPA will be available at `http://127.0.0.1:5173` (Vite default).

## Running with Docker

The repository includes a `docker-compose.yml` that builds and runs the full stack with one command.

### Prerequisites

- Docker
- Docker Compose plugin
- A MongoDB instance reachable from the backend container (or extend the compose file to include MongoDB)

### Steps

1. From the repository root, build and start the stack:

   ```bash
   docker compose up --build
   ```

2. Once the containers are running:

   - Frontend (SPA + reverse proxy): `http://localhost:8080`
   - Backend API (proxied by Nginx): `http://localhost:8080/api/*`

   In this setup, the backend is designed to be accessed through the frontend proxy only. Nginx adds a custom `X‑Internal‑Proxy` header and the backend enforces it when `APP_ENV=production`.

3. To stop the containers:

   ```bash
   docker compose down
   ```

## API Overview

### Authentication & Users (`/user`)

- `POST /user/register` – create a new user with strong password validation.
- `POST /user/login` – authenticate the user, issue a JWT, and set it in an HTTP‑only cookie.
- Protected routes read the JWT from the cookie and attach the user payload to `request.state.user`.

### Rooms (`/room`)

- `POST /room/` – create a new room (admin only).
- `GET /room/` – list rooms with pagination and computed `isFree` flag.
- `GET /room/{room_id}` – get room details by ID.
- `PUT /room/{room_id}` – update room details (admin only).
- `DELETE /room/{room_id}` – delete a room (admin only).

### Reservations (`/reservation`)

- `POST /reservation/` – create a reservation for a room, enforcing:
  - Minimum lead time of 1 day.
  - No overlapping reservations for the same room.
- `GET /reservation/room/{room_id}` – list reservations for a given room (admins see all reservations, regular users see only their own).

Pydantic models capture the business rules, including:

- Strong password requirements (length, upper/lowercase, digit, special character).
- Date ranges that must be in the future and within a 6‑month window.
- Reservation `end_datetime` must be strictly after `start_datetime`.

## Security & Reliability

This project includes several defensive mechanisms:

- **JWT‑based authentication** with strict validation and expiration.
- **HTTP‑only cookies** to reduce the risk of token theft via XSS.
- **Role checks** (admin vs user) through utilities like `require_admin`.
- **Rate limiting** middleware based on client IP to mitigate brute‑force and basic DDoS patterns.
- **CORS** rules that are stricter in production (only allowing requests coming from the internal proxy).
- **Nginx hardening** with security headers such as `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy`, and blocking access to dotfiles like `.env`.

## Why this project is relevant in 2026

This repository is built to reflect how a modern full‑stack application should look in 2026:

- Clear separation between frontend and backend with a clean Dockerized deployment story.
- Use of contemporary tooling such as **FastAPI**, **React 19**, **Vite**, **React Query**, and **Tailwind 4**.
- Strong focus on **type safety** and validation from the backend (Pydantic) to the frontend (TypeScript + zod).
- Attention to **security, observability, and production concerns** (logging, rate limiting, proxy headers, non‑root containers).
- Self‑documenting API via **Swagger/OpenAPI** and a predictable routing structure.

For a recruiter evaluating full‑stack skills, this project demonstrates:

- Backend API design, authentication and authorization, data modeling, and MongoDB integration.
- Frontend SPA development with a modern React ecosystem and UX tooling.
- DevOps awareness through Docker, Nginx reverse proxying, and environment‑based configuration.
