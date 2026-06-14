-- CreateEnum
CREATE TYPE "IdempotencyOperation" AS ENUM ('CREATE_PRODUCT');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('COMPLETED');

-- CreateTable
CREATE TABLE "idempotency_records" (
    "id" UUID NOT NULL,
    "operation" "IdempotencyOperation" NOT NULL,
    "idempotency_key" VARCHAR(255) NOT NULL,
    "request_hash" CHAR(64) NOT NULL,
    "status" "IdempotencyStatus" NOT NULL,
    "response_body" JSONB NOT NULL,
    "resource_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idempotency_records_expires_at_idx" ON "idempotency_records"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_operation_idempotency_key_key" ON "idempotency_records"("operation", "idempotency_key");
