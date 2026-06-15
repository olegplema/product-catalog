# Product Catalog

GitHub repository: `https://github.com/olegplema/product-catalog`

## About

Product Catalog is a small full-stack monorepo application for creating, listing, and deleting products.

It includes:

- `web` - React + Vite frontend
- `products-service` - NestJS API with PostgreSQL, Prisma, idempotent product creation, and transactional outbox
- `notifications-service` - NestJS worker that consumes product events from SQS
- `postgres` - persistent database
- `localstack` - local AWS SQS emulation

## Prerequisites

- Docker
- Docker Compose

## Run

1. Copy env files:

```bash
cp infra/env/postgres.env.example infra/env/postgres.env
cp infra/env/localstack.env.example infra/env/localstack.env
cp apps/products-service/.env.docker.example apps/products-service/.env
cp apps/notifications-service/.env.docker.example apps/notifications-service/.env
cp apps/web/.env.docker.example apps/web/.env
```

2. Start the full stack:

```bash
docker compose -f infra/docker-compose.yml up --build
```

3. Open the application:

```text
http://localhost:8080
```

## What Starts

- `postgres`
- `localstack`
- `products-service`
- `notifications-service`
- `web`

`products-service` applies Prisma migrations automatically on container startup.

## URLs

- Web: `http://localhost:8080`
- Products API: `http://localhost:3001`
- LocalStack: `http://localhost:4566`

## Stop

```bash
docker compose -f infra/docker-compose.yml down
```

## Local Development

If you want to run the services locally without Docker, use the local env templates instead:

```bash
cp apps/products-service/.env.local.example apps/products-service/.env
cp apps/notifications-service/.env.local.example apps/notifications-service/.env
cp apps/web/.env.local.example apps/web/.env
```
