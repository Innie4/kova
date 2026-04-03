-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PreferredMethod" AS ENUM ('WALLET', 'BANK', 'MOBILE_MONEY', 'CASH');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('DRAFT', 'PREVIEWED', 'AWAITING_CONFIRMATION', 'EXECUTING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RailName" AS ENUM ('WISE', 'KOTANI', 'KITE_NATIVE', 'MOCK');

-- CreateEnum
CREATE TYPE "AgentLogStep" AS ENUM ('INTENT_PARSED', 'RAIL_QUERY_STARTED', 'RAIL_QUERY_COMPLETED', 'ROUTE_SCORED', 'CONFIRMATION_REQUIRED', 'TRANSFER_EXECUTED', 'ATTESTATION_WRITTEN', 'NOTIFICATION_SENT', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationPreference" AS ENUM ('SMS', 'WHATSAPP', 'BOTH', 'NONE');

-- CreateEnum
CREATE TYPE "KycDocumentType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE');

-- CreateEnum
CREATE TYPE "KycDocumentStatus" AS ENUM ('UPLOADED', 'VERIFIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "kite_passport_address" TEXT,
    "kite_passport_hash" TEXT,
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "notification_preference" "NotificationPreference" NOT NULL DEFAULT 'SMS',
    "demo_mode_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kite_address" TEXT NOT NULL,
    "deposit_address" TEXT,
    "usdc_balance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "reputation_score" INTEGER NOT NULL DEFAULT 0,
    "total_savings_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferred_method" "PreferredMethod" NOT NULL,
    "bank_name" TEXT,
    "bank_account_hint" TEXT,
    "mobile_network" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "amount_usd" DECIMAL(18,6) NOT NULL,
    "fee_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "savings_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "net_delivery_usd" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "route_selected" "RailName",
    "route_reason" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'DRAFT',
    "requires_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "intent_raw" TEXT NOT NULL,
    "kite_attestation_hash" TEXT,
    "kite_attestation_url" TEXT,
    "kite_tx_hash" TEXT,
    "notification_status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "rails_queried" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rail_queries" (
    "id" TEXT NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "rail_name" "RailName" NOT NULL,
    "fee_usd" DECIMAL(18,6) NOT NULL,
    "eta_minutes" INTEGER NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "query_time_ms" INTEGER,
    "queried_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rail_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_logs" (
    "id" TEXT NOT NULL,
    "transfer_id" TEXT,
    "step" "AgentLogStep" NOT NULL,
    "detail" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_type" "KycDocumentType" NOT NULL,
    "front_path" TEXT NOT NULL,
    "back_path" TEXT,
    "metadata_hash" TEXT NOT NULL,
    "attestation_hash" TEXT,
    "status" "KycDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_kite_address_key" ON "wallets"("kite_address");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "recipients_user_id_idx" ON "recipients"("user_id");

-- CreateIndex
CREATE INDEX "transfers_sender_id_idx" ON "transfers"("sender_id");

-- CreateIndex
CREATE INDEX "transfers_recipient_id_idx" ON "transfers"("recipient_id");

-- CreateIndex
CREATE INDEX "transfers_status_idx" ON "transfers"("status");

-- CreateIndex
CREATE INDEX "rail_queries_transfer_id_idx" ON "rail_queries"("transfer_id");

-- CreateIndex
CREATE INDEX "agent_logs_transfer_id_idx" ON "agent_logs"("transfer_id");

-- CreateIndex
CREATE INDEX "kyc_documents_user_id_idx" ON "kyc_documents"("user_id");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rail_queries" ADD CONSTRAINT "rail_queries_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_logs" ADD CONSTRAINT "agent_logs_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

