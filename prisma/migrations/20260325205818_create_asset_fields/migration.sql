-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "lastPrice" DECIMAL(20,8) NOT NULL,
    "priceChangePercent" DECIMAL(10,3) NOT NULL,
    "highPrice" DECIMAL(20,8) NOT NULL,
    "lowPrice" DECIMAL(20,8) NOT NULL,
    "volume" DECIMAL(20,8) NOT NULL,
    "quoteVolume" DECIMAL(20,8) NOT NULL,
    "count" INTEGER NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Binance',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asset_symbol_idx" ON "Asset"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_timestamp_key" ON "Asset"("symbol", "timestamp");
