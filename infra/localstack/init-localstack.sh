#!/usr/bin/env bash
set -euo pipefail

QUEUE_NAME="${PRODUCT_EVENTS_QUEUE_NAME:-product-events}"
REGION="${AWS_DEFAULT_REGION:-eu-central-1}"

echo "Creating SQS queue: ${QUEUE_NAME} in region ${REGION}"

awslocal sqs create-queue \
  --queue-name "${QUEUE_NAME}" \
  --region "${REGION}"

echo "SQS queue is ready:"
awslocal sqs get-queue-url \
  --queue-name "${QUEUE_NAME}" \
  --region "${REGION}"
