# Frontend SPA

SPA em React + Vite com:

- autenticação (login + registo)
- rotas públicas e privadas com `react-router-dom`
- formulários com `react-hook-form` + `zod`
- estado global com `zustand`
- chamadas API e cache com `@tanstack/react-query`
- notificações com `react-toastify`
- UI dark por omissão com Tailwind + shadcn

## Setup

1. Crie o ficheiro `.env` com base em `.env.example`.
2. Instale dependências:

```bash
npm install
```

3. Inicie o frontend:

```bash
npm run dev
```

## Variáveis de ambiente

- `VITE_API_URL`: URL base do backend (ex: `http://localhost:8080`)

## Endpoints esperados

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
