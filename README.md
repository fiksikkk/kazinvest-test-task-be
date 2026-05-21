# Groq Chat Backend

Minimal `NestJS` + `TypeScript` backend for proxying requests to the Groq API.

The AI logic is isolated in a dedicated `AiModule`, and the current Groq provider is wired through the `AiTextGenerator` abstraction so it can be replaced later without changing the `chat` layer.

## Installation

```bash
pnpm install
cp .env.example .env
```

Fill in `GROQ_API_KEY` in `.env`. `FRONTEND_ORIGIN` is required: if it is missing, the backend will not start.

## Environment Variables

```env
PORT=3000
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
FRONTEND_ORIGIN=http://localhost:5173
SYSTEM_INSTRUCTION=Reply briefly, clearly, and in English.
```

`FRONTEND_ORIGIN` is used for CORS and must be set explicitly, with no fallback value in code.

## Run

```bash
pnpm run start:dev
```

Build:

```bash
pnpm run build
```

Tests:

```bash
pnpm run test
pnpm run test:e2e
```

Production start:

```bash
pnpm run build
pnpm run start
```

## API

`POST /chat`

Request:

```json
{
  "message": "Hello, tell me about NestJS"
}
```

Response:

```json
{
  "answer": "..."
}
```

`curl` example:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, tell me about NestJS"}'
```

If you proxy the backend through `nginx` under `/api`, the public endpoint becomes `POST /api/chat`.

## Deployment

This repository includes example deployment files for a Linux server setup:

- GitHub Actions workflow: `.github/workflows/deploy.yml`
- `systemd` unit: `deploy/kazinvest-test-api.service`
- `nginx` server example: `deploy/nginx.conf`
- production env example: `deploy/kazinvest-test-api.env.example`

## What Is Included

- request validation via `ValidationPipe`;
- CORS restricted to `FRONTEND_ORIGIN`;
- `16kb` JSON body size limit;
- rate limiting for `/chat`;
- dedicated `AiModule` with a provider abstraction for AI;
- safe Groq API error handling without leaking internal details.
