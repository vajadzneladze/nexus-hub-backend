# Nexus Hub Backend | Real-Time Crypto Analytics Platform

A high-performance, event-driven backend service built with **NestJS**, designed to ingest, process, and broadcast real-time cryptocurrency market data using **WebSockets** and **automated task scheduling**.

---

## 🏗️ Architectural Overview

This system is engineered for low-latency data flow and high consistency. It implements a robust pipeline from external liquidity providers (Binance API) to end-users via a reactive architecture.

### Key Pillars:
* **Data Ingestion (The Producer):** An automated cron-based service that synchronizes market data every 5 seconds, ensuring the local state is never stale.
* **Real-Time Gateway (The Emitter):** A WebSocket implementation using **Socket.io** with a **Room-based architecture**. This ensures users only receive data for symbols they are explicitly subscribed to, significantly reducing network overhead.
* **Persistence Layer:** **PostgreSQL** orchestrated via **Prisma ORM**, utilizing optimized `upsert` operations for data integrity and performance.
* **Data Integrity:** Custom precision handling (4-decimal truncation) and BigInt serialization patches to ensure JSON compatibility across the stack.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | NestJS (Node.js) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Real-time** | Socket.io (WebSockets) |
| **Scheduling** | NestJS Schedule (Cron) |
| **HTTP Client** | Axios (RxJS Observables) |

---

## 🚀 Key Features & Optimizations

### 1. Room-Based WebSocket Broadcasting
Unlike global broadcasting, this system utilizes **Socket.io Rooms**. When a client joins, they must subscribe to a specific symbol (e.g., `BTCUSDT`). 
* **Benefit:** Zero wasted bandwidth for the client and reduced CPU cycles for the server.

### 2. Intelligent Data Sync (Upsert Logic)
The ingestion service uses a composite unique key (`symbol_timestamp`) to perform `upsert` operations. This prevents duplicate entries while allowing for atomic updates if the source data refreshes within the same millisecond.

### 3. Precision & Performance
* **Decimals:** All financial data is processed through a transformation layer to maintain 4-decimal precision, preventing floating-point errors common in JavaScript.
* **BigInt Serialization:** Implemented a global JSON prototype patch to handle PostgreSQL `BigInt` (timestamps) seamlessly without manual string conversion in every controller.

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