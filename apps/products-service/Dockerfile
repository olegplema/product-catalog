FROM node:22-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json eslint.config.mjs prettier.config.mjs ./
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY apps/products-service/package.json ./apps/products-service/package.json
COPY apps/notifications-service/package.json ./apps/notifications-service/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @product-catalog/contracts build && pnpm --filter @product-catalog/products-service build

FROM node:22-bookworm-slim AS runtime

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /workspace/apps/products-service

COPY --from=build /workspace /workspace

CMD ["sh", "-c", "pnpm prisma:migrate:deploy && node dist/src/main.js"]
