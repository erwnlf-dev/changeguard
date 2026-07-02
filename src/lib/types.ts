// FILE: src/lib/types.ts
'use client';

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
