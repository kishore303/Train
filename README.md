# SIH26027 — AI-Assisted Automatic Block Planning for Indian Railways

**Prototype / Demonstration System — Uses Synthetic Railway Data**
**AI recommendations are decision-support outputs and require authorized human approval.**

## Problem
Indian Railways needs to maximize asset availability while scheduling maintenance blocks without disrupting train operations. Manual planning is slow, conflict-prone, and lacks coordination across Engineering/Electrical/S&T.

## Solution
RailBlock AI — Enterprise Railway Operations Platform that:
- Predicts maintenance duration / failure risk / train delay (XGBoost/RF on `ai-service/historical_operations.csv`)
- Checks compatibility (section/work/equipment/isolation/duration/safety/department)
- Detects train conflicts (route/section/arrival/departure/frequency/type)
- Detects available windows (FEASIBLE/INSUFFICIENT/TRAIN CONFLICT)
- Optimizes via OR-Tools CP-SAT (minimize duration, blocks, delay, disruption, downtime)
- Recommends **AI OPTIMAL BLOCK** (SHAP explanation) — **never auto-approves**
- Manages approval workflow (human mandatory) + Digital Twin (NetworkX) + real-time (Kafka/Redis fallback + WebSocket) + What-If simulator

## Architecture
```
Angular (4200) → NestJS (3000) → AI Service FastAPI (8000)
                     ↓  → Digital Twin (NetworkX) → Redis (fallback Map)
                     ↓  → EventBus (Kafka → in-memory) → WebSocket /live
                     ↓  → OR-Tools CP-SAT
                     ↓  → Workflows (Temporal → local state-machine)
                     → Prometheus /metrics → Grafana
```
DataRepository → LocalJsonRepository (no PostgreSQL/PostGIS in demo, DEMO_MODE=true)

## Features
- **Phase1:** Angular+Material+Tailwind, 8 pages, synthetic data (25 tasks, 35 trains, 12 sections, 35 assets, 15 blocks), Leaflet map, Chart.js
- **Phase2:** NestJS JWT/RBAC (8 roles), Repository abstraction, Risk Score 0-100, 6 demo users
- **Phase3:** FastAPI + XGBoost/SHAP/OR-Tools, compatibility, train conflict, window detection, recommendations
- **Phase4:** Digital Twin (NetworkX), Kafka/Redis fallback, WebSocket live, dynamic re-planning (`PLAN UPDATED`), What-If (OPTION A/B/C + AI OPTIMAL)
- **Phase5:** Approval workflow (3 workflows), BEFORE/AFTER analytics, S101 (3→1 block), Temporal fallback, Prometheus/Grafana, Docker/K8s, README, UI polish

## Tech Stack
- Frontend: Angular 18, TypeScript, Angular Material, Tailwind, Chart.js, Leaflet, socket.io-client
- Backend: NestJS, TypeScript, JWT, Passport, RBAC, WebSocket (socket.io), ioredis (fallback), kafkajs (fallback), Temporal fallback
- AI: Python 3.11, FastAPI, Pandas, NumPy, Scikit-learn, XGBoost, OR-Tools CP-SAT, NetworkX, SHAP (fallback)
- Infra: Docker Compose, Kubernetes manifests, Prometheus, Grafana

## Setup
```bash
# prerequisites: Node 20, Python 3.11, Docker
# 1. AI Service
cd ai-service && pip install -r requirements.txt && python -m uvicorn app:app --host 0.0.0.0 --port 8000

# 2. Backend
cd backend && npm ci && npm run build && node dist/main.js
# or npm run start:dev -> http://localhost:3000/api

# 3. Frontend
npm ci && npm start # http://localhost:4200

# Docker (DEMO_MODE=true, no Postgres)
docker compose up --build
# frontend :4200, backend :3000, ai :8000, prometheus :9090, grafana :3001 (admin/admin)
# kafka :9092, redis :6379, temporal :7233 (all with fallback if unavailable)
```

## Demo Credentials (password `demo123`)
- `admin@rail.demo` — ADMIN
- `engineering@rail.demo` — ENGINEERING_OFFICER
- `electrical@rail.demo` — ELECTRICAL_OFFICER
- `st@rail.demo` — ST_OFFICER
- `operating@rail.demo` — OPERATING_OFFICER
- `staff@rail.demo` — MAINTENANCE_STAFF (also JE_PWAY / SSE_PWAY)

## Dataset
Synthetic local JSON in `src/app/data/` and `backend/data/` + `ai-service/historical_operations.csv` (50 rows):
- `railway_sections.json` (12), `assets.json` (35), `maintenance_tasks.json` (25), `trains.json` (35), `existing_blocks.json` (15)
- Banner: `Prototype / Demonstration System — Uses Synthetic Railway Data`

## AI Explanation
- **Duration/Risk/Delay:** XGBoostRegressor/Classifier trained on `asset_condition, overdue_days, operational_impact, safety_impact, failure_risk` → 0-100 risk, `CRITICAL 80-100` etc. Fallback deterministic if training fails.
- **OR-Tools CP-SAT:** variables `x_i` for each FEASIBLE window, cost `delay + affected*15 + insuffPenalty`, `Minimize(sum x_i*cost)`, subject to single window, safety, availability, compatibility.
- **SHAP:** `shap.TreeExplainer` where practical, else deterministic feature impacts.
- Label: `AI model trained on synthetic demonstration data.`

## Digital Twin
- `ai-service/digital_twin.py` — `networkx.Graph`: stations/junctions as nodes, sections as edges.
- Assets states `AVAILABLE → BLOCKED → UNDER_MAINTENANCE → AVAILABLE` (DEGRADED).
- Endpoints `GET /twin/graph`, `/twin/assets`, `/twin/metrics`, `POST /twin/block/start|complete` → proxied via Nest `GET /api/twin/*`.

## Real-time Architecture
- **Kafka:** `EventBusService` tries `localhost:9092`, else in-memory EventEmitter. Topics: `maintenance.created, block.requested/recommended/approved/rejected/started/completed, train.updated/delayed, asset.status_changed, optimization.completed, replanning.*`
- **Redis:** `RedisService` tries `localhost:6379`, else Map for `train state, block state, dashboard metrics, optimization results`.
- **WebSocket:** `RealtimeGateway` (`/live`) broadcasts `maintenanceUpdated, trainUpdated, blockUpdated, optimizationCompleted, approvalUpdated, systemAlert, liveMetricsUpdated, replanningStarted/Completed`.
- **Re-planning:** event `train.delayed|emergency|duration|section unavailable|high-priority|resource unavailable` → `Event → Backend → OR-Tools → new recommendation → WS `PLAN UPDATED` → human approval.

## S101 Demo
`GET /api/demo/s101`:
- Engineering 45m + Electrical 30m + S&T 30m on SEC004 1km
- **BEFORE** 3 blocks 105m delay 95m
- **AFTER** 1 coordinated block 60m window `02:00-03:00` delay 18m
- Metrics: Block Reduction 66%, Delay Reduction ~81%, Availability +~25% — label `Synthetic demonstration result.`

## Analytics
`GET /api/analytics/dashboard` now returns `beforeAfter` calculated dynamically: `before {blocks, totalDuration, estimatedDelay, assetDowntime}`, `after {…}`, `metrics {blockReduction, delayReduction, coordinationEfficiency, assetAvailabilityImprovement}` — not hardcoded. S101 metrics also via `/api/demo/s101`.

## Temporal Workflows (fallback)
- `MaintenanceApprovalWorkflow`: REQUESTED→VERIFICATION→DEPARTMENT_REVIEW→OPERATING_REVIEW→AI_RECOMMENDED→AWAITING_APPROVAL→SCHEDULED→COMPLETED
- `BlockPlanningWorkflow`: DRAFT→COMPATIBILITY→TRAIN_CONFLICT→WINDOW→ORTOOLS→RECOMMENDED→APPROVAL_PENDING→SCHEDULED
- `BlockExecutionWorkflow`: SCHEDULED→BLOCKED→UNDER_MAINTENANCE→COMPLETED→RELEASED→AVAILABLE
- If Temporal server unavailable (`temporal:7233`), `WorkflowService` uses local state-machine (`DEMO_MODE=true`).

## Monitoring
- `GET /api/metrics` (Prometheus) + `/api/metrics.json`: `api_requests_total, api_latency_avg_ms, optimization_time_count, ai_prediction_count, websocket_connections, events_processed, failed_events, active_blocks, replanning_count`
- `monitoring/prometheus.yml` scrapes `backend:3000/api/metrics`, `ai-service:8000/health`
- `monitoring/grafana-dashboard.json` panels for above.

## Kubernetes
`k8s/` manifests: `frontend-deployment.yaml`, `backend-deployment.yaml`, `ai-service-deployment.yaml` (LoadBalancer, DEMO_MODE). Not production-hardened.

## Future PostgreSQL/PostGIS Migration
Current `LocalJsonRepository` implements `DataRepository`. Migration: create `PostgresRepository`/`PostGISRepository` implementing same interface, switch via `DataModule` provider, add migrations for `railway_sections` (PostGIS geometry), `assets`, `trains`, `blocks` with GiST indexes.

## Prototype Limitations
- Synthetic data only, no live IR connection, no production certification, no production ML accuracy
- Kafka/Redis/Temporal are optional — fallback in-memory
- OR-Tools and SHAP deterministic fallback if libs unavailable
- AI only recommends, never approves

## Demo Flow (end-to-end)
LOGIN (`admin/demo123`) → DASHBOARD (KPIs, before/after) → MAINTENANCE (risk) → BLOCK PLANNER → SELECT S101 → PRIORITY/RISK → COMPATIBILITY → TRAIN CONFLICT → AVAILABLE WINDOW → OR-TOOLS → SHAP → AI RECOMMENDATION (02:00-03:00) → SIMULATOR (OPTION A/B/C vs AI OPTIMAL) → SUBMIT FOR APPROVAL → HUMAN APPROVAL (Approvals page) → BLOCK SCHEDULED → LIVE EVENT (WebSocket) → TRAIN DELAY (trigger replan) → DYNAMIC RE-PLANNING → NEW RECOMMENDATION → DASHBOARD UPDATE

## How to Run (quick)
```bash
# AI
cd ai-service && python -m uvicorn app:app --port 8000
# Backend
cd backend && npm run start
# Frontend
npm start
# open http://localhost:4200 login admin@rail.demo / demo123
```
Docker: `docker compose up` → same URLs.

## Licenses
Demo prototype for SIH26027 only.
