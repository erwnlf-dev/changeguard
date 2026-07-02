// FILE: src/lib/utils.ts
'use client';

import { ChangeRequest, Service } from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateRiskScore(
  change: Partial<ChangeRequest>,
  services: Service[]
): number {
  let score = 10;

  const scopeWeights: Record<string, number> = {
    service: 10,
    database: 30,
    infrastructure: 40,
    'full-stack': 50,
  };
  score += scopeWeights[change.scope || 'service'] || 10;

  if (!change.rollbackPlan || change.rollbackPlan.trim().length < 10) {
    score += 20;
  }

  const depCount = change.dependencies?.length || 0;
  score += Math.min(depCount * 10, 30);

  if (change.dependencies && change.dependencies.length > 0) {
    const related = services.filter((s) => change.dependencies?.includes(s.id));
    if (related.length > 0) {
      const avgFailure = related.reduce((sum, s) => sum + s.failureRate, 0) / related.length;
      score += avgFailure * 1.5;
    }
  }

  // ponytail: simple linear heuristic. upgrade to regression model if risk prediction accuracy drifts.
  return Math.min(Math.max(Math.round(score), 1), 100);
}

export function exportJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importJSON<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target?.result as string));
      } catch {
        reject(new Error('Invalid JSON format'));
      }
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsText(file);
  });
}
