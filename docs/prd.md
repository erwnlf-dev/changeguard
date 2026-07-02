### 1. Product Overview
ChangeGuard is a cloud-native change risk scoring and approval workflow platform for DevOps and IT teams. It replaces heavyweight ITSM suites with automated risk analysis based on deployment patterns, dependency impact, and historical failure data.

### 2. Core Functional Requirements
- Create change requests with deployment scope, rollback plan, and risk factors
- View real-time risk score (1-100) calculated from change attributes and historical patterns
- Configure approval workflows with multi-stage gates and auto-escalation rules
- Track change implementation status with timeline and verification checkpoints
- Generate compliance reports filtered by team, risk level, or time period
- Analyze failure patterns with root cause categorization across deployments
- Set organizational risk thresholds and blocking rules for high-risk changes
- View cross-service dependency map for impact analysis

### 3. Data Model & Persistence
```typescript
interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  scope: "service" | "database" | "infrastructure" | "full-stack";
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number; // 1-100, calculated
  status: "draft" | "pending" | "approved" | "rejected" | "implemented" | "failed";
  requesterId: string;
  approverIds: string[];
  implementedAt?: number;
  rollbackPlan?: string;
  dependencies: string[]; // service IDs
  createdAt: number;
  updatedAt: number;
}

interface Service {
  id: string;
  name: string;
  owner: string;
  dependencies: string[]; // other service IDs
  lastDeployment?: number;
  failureRate: number; // percentage
  createdAt: number;
  updatedAt: number;
}

interface User {
  id: string;
  name: string;
  role: "requester" | "approver" | "admin";
  team: string;
  createdAt: number;
  updatedAt: number;
}

interface Metric {
  id: string;
  serviceId: string;
  changeId: string;
  metricType: "deployment" | "incident" | "rollback";
  value: number;
  timestamp: number;
}

interface AuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: "create" | "update" | "delete" | "approve" | "reject";
  userId: string;
  changes: Record<string, any>;
  timestamp: number;
}
```

Storage keys: `app_changeRequests`, `app_services`, `app_users`, `app_metrics`, `app_auditLogs`.

### 4. Pages, Routes & FUNCTIONALITY
- **Landing page (/)**: Decide/Learn surface. Hero with risk calculator demo, features (6+), pricing (3 tiers), FAQ (6+), social proof, CTA, footer. Marketing only.
- **Dashboard (/dashboard)**: Monitor surface. Risk distribution chart from real data. Recent changes list with status. Failure rate trends by service. Service health cards with live metrics.
- **Change Requests (/dashboard/changes)**: Operate surface. Filterable table by risk/status/service. Create via modal with risk scoring. Inline status updates. Bulk approve/reject for pending.
- **Change Detail (/dashboard/changes/[id])**: Operate surface. Risk breakdown visualization. Approval workflow timeline. Dependency impact map. Verification checklist with status transitions.
- **Services (/dashboard/services)**: Operate surface. Service list with failure rates. Create/edit service dependencies. Dependency matrix visualization. Last deployment tracking.
- **Settings (/dashboard/settings)**: Configure surface. Risk threshold sliders (persist). Notification preferences (persist). User role assignments (persist). Data export (JSON download). Data import (JSON upload). Reset database (confirm -> clear localStorage + reseed).

### 5. Component Specification per Page
- **Dashboard**: Sidebar(240px), RiskDistributionChart(pie from real data), RecentChangesFeed(last 10), ServiceHealthCards(computed metrics), FailureTrendChart(line graph)
- **Change Requests**: FilterBar(status, risk, service), DataTable(real CRUD), BulkActionsToolbar, CreateChangeModal(form with live scoring), StatusBadge(with transitions)
- **Change Detail**: RiskScoreGauge(1-100 visualization), ApprovalTimeline(approvers, status), DependencyMap(visual graph), ChecklistItem(toggleable verification steps)
- **Services**: ServiceTable(dependency counts), DependencyMatrix(interactive grid), FailureRateBadges(per service), CreateServiceModal(form with dependency picker)
- **Settings**: ThresholdSliders(risk cutoffs), NotificationToggles(persist), UserRolesTable(assignable), DataExportButton, DataImportButton(confirm), ResetDatabaseButton(confirm)

### 6. User Flows
1. "User creates change request -> fills form (title, scope, description) -> app calculates risk score (1-100) -> saves to localStorage -> shows in list with pending status -> triggers approval workflow"
2. "Approver reviews request -> views risk breakdown and dependency impact -> approves/rejects with comment -> status updates in localStorage -> requester sees notification in feed"
3. "User imports previous data -> uploads JSON file -> app validates schema -> merges with existing data -> recalculates all risk scores -> updates all dependent views"

### 7. Mock Data
Seed on first app load (check `app_changeRequests` empty):
- 12 change requests across all statuses/risk levels
- 8 services with realistic dependencies (auth, payments, notifications, etc.)
- 4 users (2 requesters, 1 approver, 1 admin)
- 50 metrics (deployments, incidents, rollbacks) over 30 days
- 20 audit log entries

### 8. File Manifest
```json
[
  {"path": "src/app/layout.tsx", "purpose": "Root layout: Inter font, dark theme, metadata, GlobalProvider wrapper", "dependencies": []},
  {"path": "src/app/globals.css", "purpose": "Tailwind directives + CSS custom properties + risk color scales", "dependencies": []},
  {"path": "src/app/page.tsx", "purpose": "Landing page — Decide/Learn surface: hero with risk calculator, features, pricing, FAQ", "dependencies": []},
  {"path": "src/app/dashboard/layout.tsx", "purpose": "Dashboard layout: sidebar nav + topbar + StoreProvider wrapper", "dependencies": ["src/lib/store.tsx"]},
  {"path": "src/app/dashboard/page.tsx", "purpose": "Dashboard home — Monitor surface: risk distribution, recent changes, service health", "dependencies": ["src/lib/store.tsx", "src/lib/types.ts"]},
  {"path": "src/app/dashboard/changes/page.tsx", "purpose": "Change requests CRUD — Operate surface: filterable table, create/edit/delete", "dependencies": ["src/lib/store.tsx", "src/lib/types.ts"]},
  {"path": "src/app/dashboard/changes/[id]/page.tsx", "purpose": "Change detail — Operate surface: risk breakdown, approval timeline, dependency map", "dependencies": ["src/lib/store.tsx", "src/lib/types.ts"]},
  {"path": "src/app/dashboard/services/page.tsx", "purpose": "Services CRUD — Operate surface: service table, dependency matrix", "dependencies": ["src/lib/store.tsx", "src/lib/types.ts"]},
  {"path": "src/app/dashboard/settings/page.tsx", "purpose": "Settings — Configure surface: thresholds, notifications, data import/export/reset", "dependencies": ["src/lib/store.tsx", "src/lib/utils.ts"]},
  {"path": "src/lib/store.tsx", "purpose": "React Context + useReducer global state: all CRUD, localStorage sync, risk scoring, seed data", "dependencies": ["src/lib/types.ts"]},
  {"path": "src/lib/types.ts", "purpose": "TypeScript interfaces for ChangeRequest, Service, User, Metric, AuditLog", "dependencies": []},
  {"path": "src/lib/utils.ts", "purpose": "Utilities: calculateRiskScore, generateId, formatDate, exportJSON, importJSON", "dependencies": []}
]
```