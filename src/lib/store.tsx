// FILE: src/lib/store.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  scope: "service" | "database" | "infrastructure" | "full-stack";
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  status: "draft" | "pending" | "approved" | "rejected" | "implemented" | "failed";
  requesterId: string;
  approverIds: string[];
  implementedAt?: number;
  rollbackPlan?: string;
  dependencies: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Service {
  id: string;
  name: string;
  owner: string;
  dependencies: string[];
  lastDeployment?: number;
  failureRate: number;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  role: "requester" | "approver" | "admin";
  team: string;
  createdAt: number;
  updatedAt: number;
}

export interface Metric {
  id: string;
  serviceId: string;
  changeId: string;
  metricType: "deployment" | "incident" | "rollback";
  value: number;
  timestamp: number;
}

export interface AuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: "create" | "update" | "delete" | "approve" | "reject";
  userId: string;
  changes: Record<string, any>;
  timestamp: number;
}

export interface State {
  changeRequests: ChangeRequest[];
  services: Service[];
  users: User[];
  metrics: Metric[];
  auditLogs: AuditLog[];
  loaded: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

type Action =
  | { type: 'LOAD_STATE'; payload: Omit<State, 'loaded' | 'toast'> }
  | { type: 'SEED' }
  | { type: 'ADD_ENTITY'; entityType: keyof Omit<State, 'loaded' | 'toast'>; data: any }
  | { type: 'UPDATE_ENTITY'; entityType: keyof Omit<State, 'loaded' | 'toast'>; id: string; data: any }
  | { type: 'DELETE_ENTITY'; entityType: keyof Omit<State, 'loaded' | 'toast'>; id: string }
  | { type: 'TOAST'; message: string; toastType: 'success' | 'error' | 'info' }
  | { type: 'DISMISS_TOAST' };

const STORAGE_KEYS = {
  changeRequests: 'app_changeRequests',
  services: 'app_services',
  users: 'app_users',
  metrics: 'app_metrics',
  auditLogs: 'app_auditLogs',
};

const INITIAL_STATE: State = {
  changeRequests: [],
  services: [],
  users: [],
  metrics: [],
  auditLogs: [],
  loaded: false,
  toast: null,
};

export function calculateRiskScore(
  change: Partial<ChangeRequest>,
  services: Service[]
): { score: number; level: ChangeRequest['riskLevel'] } {
  let score = 10;

  const scopeWeights = { service: 10, database: 30, infrastructure: 40, 'full-stack': 50 };
  score += scopeWeights[change.scope || 'service'];

  const deps = change.dependencies || [];
  score += Math.min(deps.length * 10, 30);

  let maxFailureRate = 0;
  deps.forEach(depId => {
    const s = services.find(x => x.id === depId);
    if (s && s.failureRate > maxFailureRate) {
      maxFailureRate = s.failureRate;
    }
  });
  score += Math.min(Math.round(maxFailureRate * 2), 20);

  if (!change.rollbackPlan || change.rollbackPlan.trim().length < 10) {
    score += 10;
  }

  score = Math.max(1, Math.min(100, score));

  let level: ChangeRequest['riskLevel'] = 'low';
  if (score >= 85) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 30) level = 'medium';

  return { score, level };
}

const SEED_SERVICES: Service[] = [
  { id: 's1', name: 'auth-service', owner: 'SecOps', dependencies: [], failureRate: 2.5, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 's2', name: 'payment-gateway', owner: 'FinanceEng', dependencies: ['s1'], failureRate: 1.2, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 's3', name: 'inventory-api', owner: 'CatalogTeam', dependencies: [], failureRate: 4.8, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 's4', name: 'order-processor', owner: 'CheckoutTeam', dependencies: ['s2', 's3'], failureRate: 8.5, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 's5', name: 'notification-router', owner: 'Comms', dependencies: [], failureRate: 0.5, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 's6', name: 'search-indexer', owner: 'Discovery', dependencies: ['s3'], failureRate: 12.0, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 's7', name: 'recommendation-engine', owner: 'DataScience', dependencies: ['s6'], failureRate: 15.4, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 's8', name: 'frontend-monolith', owner: 'WebTeam', dependencies: ['s1', 's4', 's5'], failureRate: 3.1, createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
];

const SEED_USERS: User[] = [
  { id: 'u1', name: 'Alice Vance', role: 'admin', team: 'Platform', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 'u2', name: 'Bob Miller', role: 'requester', team: 'Checkout', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 'u3', name: 'Charlie Song', role: 'approver', team: 'SecOps', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 'u4', name: 'Diana Prince', role: 'approver', team: 'Platform', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 'u5', name: 'Evan Wright', role: 'requester', team: 'Discovery', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 'u6', name: 'Fiona Gallagher', role: 'approver', team: 'Finance', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 'u7', name: 'George Costanza', role: 'requester', team: 'Comms', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
  { id: 'u8', name: 'Helen Cho', role: 'admin', team: 'Security', createdAt: Date.now() - 30 * 86400000, updatedAt: Date.now() },
];

const SEED_CHANGES: ChangeRequest[] = [
  {
    id: 'c1',
    title: 'Upgrade Auth Token Expiry Logic',
    description: 'Migrate JWT validation to use short-lived access tokens and sliding refresh tokens.',
    scope: 'service',
    riskLevel: 'medium',
    riskScore: 35,
    status: 'implemented',
    requesterId: 'u2',
    approverIds: ['u3'],
    implementedAt: Date.now() - 5 * 86400000,
    rollbackPlan: 'Revert auth-service image tag to v2.4.1 and clear redis cache.',
    dependencies: ['s1'],
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'c2',
    title: 'Database Schema Migration for Orders',
    description: 'Add index on customer_id and order_date to speed up checkout history queries.',
    scope: 'database',
    riskLevel: 'high',
    riskScore: 65,
    status: 'approved',
    requesterId: 'u2',
    approverIds: ['u4', 'u6'],
    rollbackPlan: 'Run migration down script to drop index concurrently.',
    dependencies: ['s4', 's3'],
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'c3',
    title: 'Kubernetes Ingress Controller Update',
    description: 'Upgrade ingress-nginx controller from v1.1.0 to v1.8.0 to patch CVEs.',
    scope: 'infrastructure',
    riskLevel: 'critical',
    riskScore: 90,
    status: 'pending',
    requesterId: 'u1',
    approverIds: [],
    rollbackPlan: 'Helm rollback ingress-nginx to previous revision.',
    dependencies: ['s8', 's1', 's2'],
    createdAt: Date.now() - 12 * 3600000,
    updatedAt: Date.now() - 12 * 3600000,
  },
  {
    id: 'c4',
    title: 'Update Recommendation Model Weights',
    description: 'Deploy new collaborative filtering model weights for Q3 recommendations.',
    scope: 'service',
    riskLevel: 'medium',
    riskScore: 45,
    status: 'failed',
    requesterId: 'u5',
    approverIds: ['u4'],
    implementedAt: Date.now() - 3 * 86400000,
    rollbackPlan: 'Symlink model path back to model_v12_final.',
    dependencies: ['s7'],
    createdAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'c5',
    title: 'Add SMS Notification Provider',
    description: 'Integrate Twilio fallback route when AWS SNS fails.',
    scope: 'service',
    riskLevel: 'low',
    riskScore: 20,
    status: 'draft',
    requesterId: 'u7',
    approverIds: [],
    rollbackPlan: 'Disable Twilio feature flag in LaunchDarkly.',
    dependencies: ['s5'],
    createdAt: Date.now() - 4 * 3600000,
    updatedAt: Date.now() - 4 * 3600000,
  },
];

const SEED_METRICS: Metric[] = [
  { id: 'm1', serviceId: 's1', changeId: 'c1', metricType: 'deployment', value: 1, timestamp: Date.now() - 5 * 86400000 },
  { id: 'm2', serviceId: 's7', changeId: 'c4', metricType: 'deployment', value: 1, timestamp: Date.now() - 3 * 86400000 },
  { id: 'm3', serviceId: 's7', changeId: 'c4', metricType: 'incident', value: 1, timestamp: Date.now() - 3 * 86400000 + 1800000 },
  { id: 'm4', serviceId: 's7', changeId: 'c4', metricType: 'rollback', value: 1, timestamp: Date.now() - 3 * 86400000 + 3600000 },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'a1', entityId: 'c1', entityType: 'changeRequests', action: 'create', userId: 'u2', changes: {}, timestamp: Date.now() - 7 * 86400000 },
  { id: 'a2', entityId: 'c1', entityType: 'changeRequests', action: 'approve', userId: 'u3', changes: { status: 'approved' }, timestamp: Date.now() - 6 * 86400000 },
  { id: 'a3', entityId: 'c1', entityType: 'changeRequests', action: 'update', userId: 'u2', changes: { status: 'implemented' }, timestamp: Date.now() - 5 * 86400000 },
  { id: 'a4', entityId: 'c4', entityType: 'changeRequests', action: 'create', userId: 'u5', changes: {}, timestamp: Date.now() - 4 * 86400000 },
  { id: 'a5', entityId: 'c4', entityType: 'changeRequests', action: 'approve', userId: 'u4', changes: { status: 'approved' }, timestamp: Date.now() - 3.5 * 86400000 },
  { id: 'a6', entityId: 'c4', entityType: 'changeRequests', action: 'update', userId: 'u5', changes: { status: 'failed' }, timestamp: Date.now() - 3 * 86400000 },
];

function storeReducer(state: State, action: Action): State {
  let newState: State;

  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, loaded: true };

    case 'SEED':
      newState = {
        ...state,
        changeRequests: SEED_CHANGES,
        services: SEED_SERVICES,
        users: SEED_USERS,
        metrics: SEED_METRICS,
        auditLogs: SEED_AUDIT_LOGS,
        loaded: true,
        toast: { message: 'Database seeded with demo data', type: 'success' },
      };
      break;

    case 'ADD_ENTITY': {
      const list = state[action.entityType] as any[];
      const newItem = {
        ...action.data,
        id: action.data.id || Math.random().toString(36).substring(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (action.entityType === 'changeRequests') {
        const { score, level } = calculateRiskScore(newItem, state.services);
        newItem.riskScore = score;
        newItem.riskLevel = level;
      }

      newState = {
        ...state,
        [action.entityType]: [...list, newItem],
        toast: { message: `Created new ${action.entityType.slice(0, -1)}`, type: 'success' },
      };
      break;
    }

    case 'UPDATE_ENTITY': {
      const list = state[action.entityType] as any[];
      const updatedList = list.map(item => {
        if (item.id === action.id) {
          const merged = { ...item, ...action.data, updatedAt: Date.now() };
          if (action.entityType === 'changeRequests') {
            const { score, level } = calculateRiskScore(merged, state.services);
            merged.riskScore = score;
            merged.riskLevel = level;
          }
          return merged;
        }
        return item;
      });

      newState = {
        ...state,
        [action.entityType]: updatedList,
        toast: { message: `Updated ${action.entityType.slice(0, -1)}`, type: 'success' },
      };
      break;
    }

    case 'DELETE_ENTITY': {
      const list = state[action.entityType] as any[];
      newState = {
        ...state,
        [action.entityType]: list.filter(item => item.id !== action.id),
        toast: { message: `Deleted ${action.entityType.slice(0, -1)}`, type: 'success' },
      };
      break;
    }

    case 'TOAST':
      return {
        ...state,
        toast: { message: action.message, type: action.toastType },
      };

    case 'DISMISS_TOAST':
      return {
        ...state,
        toast: null,
      };

    default:
      return state;
  }

  if (typeof window !== 'undefined') {
    Object.keys(STORAGE_KEYS).forEach(key => {
      const stateKey = key as keyof typeof STORAGE_KEYS;
      localStorage.setItem(STORAGE_KEYS[stateKey], JSON.stringify(newState[stateKey]));
    });
  }

  return newState;
}

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, INITIAL_STATE);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadedData: Partial<State> = {};
    let hasData = false;

    Object.keys(STORAGE_KEYS).forEach(key => {
      const stateKey = key as keyof typeof STORAGE_KEYS;
      const stored = localStorage.getItem(STORAGE_KEYS[stateKey]);
      if (stored) {
        try {
          loadedData[stateKey] = JSON.parse(stored);
          hasData = true;
        } catch (e) {
          console.error(`Failed to parse storage key ${key}`, e);
        }
      }
    });

    if (hasData) {
      dispatch({
        type: 'LOAD_STATE',
        payload: {
          changeRequests: loadedData.changeRequests || [],
          services: loadedData.services || [],
          users: loadedData.users || [],
          metrics: loadedData.metrics || [],
          auditLogs: loadedData.auditLogs || [],
        },
      });
    } else {
      dispatch({ type: 'SEED' });
    }
  }, []);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
