# Nexus Hub Backend | Real-Time Crypto Analytics Platform

A high-performance, event-driven backend service built with **NestJS**, designed to ingest, process, and broadcast real-time cryptocurrency market data using **WebSockets**, **automated task scheduling**, and **multi-level caching**.

---

## 🏗️ Architectural Overview

This system is engineered for low-latency data flow and high consistency. It implements a robust pipeline from external liquidity providers (Binance API) to end-users via a reactive architecture.

### Key Pillars:
* **Data Ingestion (The Producer):** An automated cron-based service that synchronizes market data every 5 seconds, ensuring the local state is never stale.
* **Hybrid Caching (The Accelerator):** Implements a **Cache-Aside strategy** using `cache-manager`. High-frequency "Latest Price" requests are served directly from RAM, bypassing the database for sub-millisecond response times.
* **Real-Time Gateway (The Emitter):** A WebSocket implementation using **Socket.io** with a **Room-based architecture**. Users receive updates only for subscribed symbols, minimizing network overhead.
* **Persistence Layer:** **PostgreSQL** orchestrated via **Prisma ORM**, utilizing optimized `upsert` operations.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | NestJS (Node.js) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Caching** | Cache-Manager (In-Memory / Redis-ready) |
| **Real-time** | Socket.io (WebSockets) |
| **Scheduling** | NestJS Schedule (Cron) |

---

## 🚀 Key Features & Optimizations

### 1. Advanced Caching Strategy
To ensure maximum scalability, the system implements a caching layer for all "Latest Price" queries.
* **Write-Through:** Every 5 seconds, the ingestion service updates the cache.
* **Cache-Aside:** API endpoints first check the cache before querying PostgreSQL.
* **Benefit:** Significant reduction in DB IOPS and near-instant API responses.

### 2. Room-Based WebSocket Broadcasting
Utilizes **Socket.io Rooms** to segregate traffic. Clients only receive data for the specific assets they track, reducing client-side processing.

### 3. Data Integrity & Serialization
* **BigInt Interceptor:** A global interceptor handles PostgreSQL `BigInt` (timestamps) serialization to JSON automatically, preventing common JavaScript runtime errors.
* **Precision Handling:** Financial data is normalized to 4-decimal precision across the entire pipeline.

---

## 🚦 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL
* pnpm (recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/vajadzneladze/nexus-hub-backend.git](https://github.com/vajadzneladze/nexus-hub-backend.git)