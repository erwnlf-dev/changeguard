// FILE: src/app/dashboard/changes/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '../../../../lib/store';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Clock, ArrowLeft, GitFork, User, Calendar, FileText, Play } from 'lucide-react';

export default function ChangeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { state, dispatch } = useStore();

  const change = state.changeRequests.find((r) => r.id === id);
  if (!change) {
    return (
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex flex-col items-center justify-center p-6">
        <p className="text-[#8a8f98] mb-4">Change request not found.</p>
        <button onClick={() => router.push('/dashboard/changes')} className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]">
          Back to Changes
        </button>
      </div>
    );
  }

  const requester = state.users.find((u) => u.id === change.requesterId);
  const approvers = state.users.filter((u) => change.approverIds.includes(u.id));
  
  // Resolve dependencies to actual service objects
  const depServices = state.services.filter((s) => change.dependencies.includes(s.id));

  const updateStatus = (newStatus: typeof change.status) => {
    const updated = {
      ...change,
      status: newStatus,
      updatedAt: Date.now(),
      ...(newStatus === 'implemented' ? { implementedAt: Date.now() } : {}),
    };

    dispatch({
      type: 'UPDATE_ENTITY',
      entityType: 'changeRequests',
      data: updated,
    });

    dispatch({
      type: 'TOAST',
      message: `Status updated to ${newStatus}`,
      toastType: 'success',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
      case 'rejected': return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
      case 'pending': return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20';
      case 'implemented': return 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20';
      case 'failed': return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
      default: return 'bg-[#8a8f98]/10 text-[#8a8f98] border-[#8a8f98]/20';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-[#ef4444]';
    if (score >= 50) return 'text-[#f59e0b]';
    return 'text-[#10b981]';
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button 
            onClick={() => router.push('/dashboard/changes')}
            className="flex items-center gap-2 text-sm text-[#8a8f98] hover:text-[#f7f8f8] transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Changes
          </button>
          
          <div className="flex flex-wrap gap-2">
            {change.status === 'pending' && (
              <>
                <button 
                  onClick={() => updateStatus('approved')}
                  className="rounded-md bg-[#10b981] px-4 py-2 text-sm font-medium text-white hover:bg-[#10b981]/80"
                >
                  Approve Change
                </button>
                <button 
                  onClick={() => updateStatus('rejected')}
                  className="rounded-md bg-[#ef4444] px-4 py-2 text-sm font-medium text-white hover:bg-[#ef4444]/80"
                >
                  Reject Change
                </button>
              </>
            )}
            {change.status === 'approved' && (
              <button 
                onClick={() => updateStatus('implemented')}
                className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Mark Implemented
              </button>
            )}
            {change.status === 'implemented' && (
              <button 
                onClick={() => updateStatus('failed')}
                className="rounded-md bg-[#ef4444] px-4 py-2 text-sm font-medium text-white hover:bg-[#ef4444]/80"
              >
                Report Failure / Rollback
              </button>
            )}
          </div>
        </div>

        {/* Header Card */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(change.status)}`}>
                  {change.status.toUpperCase()}
                </span>
                <span className="text-xs text-[#8a8f98] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {new Date(change.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#f7f8f8]">{change.title}</h1>
              <p className="text-sm text-[#8a8f98] mt-2 max-w-2xl">{change.description}</p>
            </div>

            <div className="flex items-center gap-4 bg-[#191a1b] p-4 rounded-lg border border-[rgba(255,255,255,0.08)]">
              <div className="text-center">
                <div className="text-xs text-[#8a8f98] uppercase font-semibold">Risk Score</div>
                <div className={`text-3xl font-bold ${getRiskColor(change.riskScore)}`}>{change.riskScore}</div>
              </div>
              <div className="h-8 w-px bg-[rgba(255,255,255,0.08)]" />
              <div>
                <div className="text-xs text-[#8a8f98] uppercase font-semibold">Scope</div>
                <div className="text-sm font-medium text-[#f7f8f8] capitalize">{change.scope}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Details & Dependency Map */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Rollback Plan */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
              <h2 className="text-sm font-semibold text-[#f7f8f8] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5e6ad2]" /> Rollback Plan
              </h2>
              <div className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-4 text-sm text-[#d0d6e0] whitespace-pre-wrap">
                {change.rollbackPlan || "No rollback plan provided."}
              </div>
            </div>

            {/* Dependency Map */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
              <h2 className="text-sm font-semibold text-[#f7f8f8] mb-4 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-[#5e6ad2]" /> Dependency Impact Map
              </h2>
              
              {depServices.length === 0 ? (
                <p className="text-sm text-[#8a8f98]">No downstream service dependencies declared.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#191a1b] rounded-md border border-[rgba(255,255,255,0.08)]">
                    <div>
                      <div className="text-xs text-[#8a8f98]">Target Scope</div>
                      <div className="text-sm font-medium text-[#f7f8f8] capitalize">{change.scope}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#8a8f98]">Direct Impact</div>
                      <div className="text-sm font-medium text-[#ef4444]">{depServices.length} Services</div>
                    </div>
                  </div>

                  <div className="relative pl-6 border-l border-[rgba(255,255,255,0.08)] space-y-3">
                    {depServices.map((service) => (
                      <div key={service.id} className="relative flex items-center justify-between p-3 bg-[#0f1011] rounded-md border border-[rgba(255,255,255,0.05)]">
                        <div className="absolute -left-[25px] w-4 h-px bg-[rgba(255,255,255,0.08)]" />
                        <div>
                          <div className="text-sm font-medium text-[#f7f8f8]">{service.name}</div>
                          <div className="text-xs text-[#8a8f98]">Owner: {service.owner}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[#8a8f98]">Failure Rate</div>
                          <div className={`text-xs font-semibold ${service.failureRate > 15 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                            {service.failureRate}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Risk Analysis & Approvals */}
          <div className="space-y-6">
            
            {/* Risk Breakdown */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
              <h2 className="text-sm font-semibold text-[#f7f8f8] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#5e6ad2]" /> Risk Analysis
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#8a8f98]">Scope Weight</span>
                  <span className="font-medium text-[#f7f8f8] capitalize">{change.scope}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#8a8f98]">Dependency Count</span>
                  <span className="font-medium text-[#f7f8f8]">{change.dependencies.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#8a8f98]">Historical Failure Risk</span>
                  <span className="font-medium text-[#f7f8f8]">
                    {depServices.some(s => s.failureRate > 10) ? 'High' : 'Low'}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-start gap-2.5 text-xs text-[#8a8f98] bg-[#191a1b] p-3 rounded-md border border-[rgba(255,255,255,0.08)]">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                    <span>
                      {change.riskScore >= 70 
                        ? "High risk score requires manual approval from all assigned gates before deployment." 
                        : "Standard risk profile. Auto-approval eligible if tests pass."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Timeline */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5">
              <h2 className="text-sm font-semibold text-[#f7f8f8] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5e6ad2]" /> Approval Flow
              </h2>

              <div className="space-y-4">
                {/* Requester */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5e6ad2]/20 flex items-center justify-center text-[#5e6ad2] shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#8a8f98]">Requested By</div>
                    <div className="text-sm font-medium text-[#f7f8f8]">{requester?.name || 'Unknown User'}</div>
                    <div className="text-xs text-[#62666d]">{requester?.team}</div>
                  </div>
                </div>

                <div className="w-px h-4 bg-[rgba(255,255,255,0.08)] ml-3" />

                {/* Approvers */}
                {approvers.map((approver) => (
                  <div key={approver.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs text-[#8a8f98]">Approver Gate</div>
                      <div className="text-sm font-medium text-[#f7f8f8]">{approver.name}</div>
                      <div className="text-xs text-[#62666d]">{approver.team}</div>
                    </div>
                  </div>
                ))}

                {approvers.length === 0 && (
                  <div className="text-xs text-[#8a8f98] italic">No specific approvers assigned.</div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ponytail: static dependency visualization. Upgrade to interactive cytoscape/d3 graph when service count > 50.

[code] → skipped: interactive cytoscape graph, add when service count > 50.