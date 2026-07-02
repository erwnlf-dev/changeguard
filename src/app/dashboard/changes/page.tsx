// FILE: src/app/dashboard/changes/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '@/lib/store';
import { ChangeRequest, Service, User } from '@/lib/types';
import { Plus, Search, Edit2, Trash2, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ChangeRequestsPage() {
  const { state, dispatch } = useStore();
  
  // Safe fallbacks for store state structure
  const changeRequests = useMemo(() => state.changeRequests || state.entities?.changeRequests || [], [state]);
  const services = useMemo(() => state.services || state.entities?.services || [], [state]);
  const users = useMemo(() => state.users || state.entities?.users || [], [state]);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChange, setEditingChange] = useState<ChangeRequest | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope: 'service' as ChangeRequest['scope'],
    riskLevel: 'low' as ChangeRequest['riskLevel'],
    rollbackPlan: '',
    dependencies: [] as string[],
    requesterId: '',
    approverIds: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts: Cmd/Ctrl+K to focus search, Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setEditingChange(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set default requester/approver when modal opens
  useEffect(() => {
    if (isModalOpen && !editingChange) {
      const defaultRequester = users.find(u => u.role === 'requester')?.id || users[0]?.id || '';
      const defaultApprover = users.find(u => u.role === 'approver')?.id || users[1]?.id || '';
      setFormData({
        title: '',
        description: '',
        scope: 'service',
        riskLevel: 'low',
        rollbackPlan: '',
        dependencies: [],
        requesterId: defaultRequester,
        approverIds: defaultApprover ? [defaultApprover] : [],
      });
      setFormErrors({});
    }
  }, [isModalOpen, editingChange, users]);

  // Populate form when editing
  useEffect(() => {
    if (editingChange) {
      setFormData({
        title: editingChange.title,
        description: editingChange.description,
        scope: editingChange.scope,
        riskLevel: editingChange.riskLevel,
        rollbackPlan: editingChange.rollbackPlan || '',
        dependencies: editingChange.dependencies || [],
        requesterId: editingChange.requesterId,
        approverIds: editingChange.approverIds || [],
      });
      setFormErrors({});
    }
  }, [editingChange]);

  // Calculate dynamic risk score (1-100)
  const calculatedRiskScore = useMemo(() => {
    let score = 10;
    
    // Scope impact
    const scopeWeights = { service: 10, database: 25, infrastructure: 40, 'full-stack': 50 };
    score += scopeWeights[formData.scope] || 0;

    // Risk level base
    const riskWeights = { low: 5, medium: 15, high: 30, critical: 45 };
    score += riskWeights[formData.riskLevel] || 0;

    // Dependency impact
    score += (formData.dependencies.length * 8);

    return Math.min(100, Math.max(1, score));
  }, [formData.scope, formData.riskLevel, formData.dependencies]);

  // Filtered change requests
  const filteredChanges = useMemo(() => {
    return changeRequests.filter((cr) => {
      const matchesSearch = cr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cr.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cr.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || cr.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || cr.riskLevel === riskFilter;
      const matchesScope = scopeFilter === 'all' || cr.scope === scopeFilter;

      return matchesSearch && matchesStatus && matchesRisk && matchesScope;
    });
  }, [changeRequests, searchQuery, statusFilter, riskFilter, scopeFilter]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.requesterId) errors.requesterId = 'Requester is required';
    if (formData.approverIds.length === 0) errors.approverIds = 'At least one approver is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const timestamp = Date.now();

    if (editingChange) {
      const updated: ChangeRequest = {
        ...editingChange,
        ...formData,
        riskScore: calculatedRiskScore,
        updatedAt: timestamp,
      };
      dispatch({ type: 'UPDATE_ENTITY', entityType: 'changeRequests', entity: updated });
      dispatch({ type: 'TOAST', message: 'Change request updated successfully', status: 'success' });
    } else {
      const newChange: ChangeRequest = {
        id: `cr-${Math.random().toString(36).substr(2, 9)}`,
        ...formData,
        riskScore: calculatedRiskScore,
        status: 'draft',
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      dispatch({ type: 'ADD_ENTITY', entityType: 'changeRequests', entity: newChange });
      dispatch({ type: 'TOAST', message: 'Change request created successfully', status: 'success' });
    }

    setIsModalOpen(false);
    setEditingChange(null);
  };

  // Delete single change request
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this change request?')) {
      dispatch({ type: 'DELETE_ENTITY', entityType: 'changeRequests', id });
      dispatch({ type: 'TOAST', message: 'Change request deleted', status: 'success' });
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected change requests?`)) {
      selectedIds.forEach(id => {
        dispatch({ type: 'DELETE_ENTITY', entityType: 'changeRequests', id });
      });
      dispatch({ type: 'TOAST', message: `Deleted ${selectedIds.length} change requests`, status: 'success' });
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = (status: ChangeRequest['status']) => {
    selectedIds.forEach(id => {
      const cr = changeRequests.find(x => x.id === id);
      if (cr) {
        dispatch({
          type: 'UPDATE_ENTITY',
          entityType: 'changeRequests',
          entity: { ...cr, status, updatedAt: Date.now() }
        });
      }
    });
    dispatch({ type: 'TOAST', message: `Updated ${selectedIds.length} changes to ${status}`, status: 'success' });
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredChanges.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredChanges.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Helper styles for badges
  const getStatusBadgeClass = (status: ChangeRequest['status']) => {
    const base = 'rounded-md px-2 py-0.5 text-xs font-medium ';
    switch (status) {
      case 'draft': return base + 'bg-gray-800 text-gray-300';
      case 'pending': return base + 'bg-yellow-950 text-yellow-400 border border-yellow-800/30';
      case 'approved': return base + 'bg-emerald-950 text-emerald-400 border border-emerald-800/30';
      case 'rejected': return base + 'bg-rose-950 text-rose-400 border border-rose-800/30';
      case 'implemented': return base + 'bg-blue-950 text-blue-400 border border-blue-800/30';
      case 'failed': return base + 'bg-red-950 text-red-400 border border-red-800/30';
      default: return base + 'bg-gray-800 text-gray-300';
    }
  };

  const getRiskBadgeClass = (risk: ChangeRequest['riskLevel']) => {
    const base = 'rounded-md px-2 py-0.5 text-xs font-medium ';
    switch (risk) {
      case 'low': return base + 'bg-emerald-950/40 text-emerald-400';
      case 'medium': return base + 'bg-yellow-950/40 text-yellow-400';
      case 'high': return base + 'bg-orange-950/40 text-orange-400';
      case 'critical': return base + 'bg-red-950/40 text-red-400 border border-red-800/50';
      default: return base + 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f7f8f8]">Change Requests</h1>
          <p className="text-sm text-[#8a8f98]">Manage, evaluate risk, and approve production deployments.</p>
        </div>
        <button
          onClick={() => {
            setEditingChange(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Change Request
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8a8f98]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search changes... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] pl-9 pr-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="implemented">Implemented</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
            >
              <option value="all">All Risks</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
            >
              <option value="all">All Scopes</option>
              <option value="service">Service</option>
              <option value="database">Database</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="full-stack">Full-Stack</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#191a1b] p-2 px-3 border border-[rgba(255,255,255,0.05)]">
            <span className="text-xs text-[#8a8f98] font-medium">
              {selectedIds.length} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('approved')}
                className="flex items-center gap-1 rounded bg-emerald-950 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-900"
              >
                <Check className="h-3 w-3" /> Approve
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('rejected')}
                className="flex items-center gap-1 rounded bg-rose-950 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-900"
              >
                <X className="h-3 w-3" /> Reject
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 rounded bg-red-950 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-900"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011]">
        <table className="w-full border-collapse text-left text-sm text-[#d0d6e0]">
          <thead className="border-b border-[rgba(255,255,255,0.05)] bg-[#191a1b]/50 text-xs uppercase text-[#8a8f98]">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={filteredChanges.length > 0 && selectedIds.length === filteredChanges.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[rgba(255,255,255,0.2)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                />
              </th>
              <th className="p-4">Change Request</th>
              <th className="p-4">Scope</th>
              <th className="p-4">Risk Level</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Requester</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
            {filteredChanges.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-[#8a8f98]">
                  No change requests found matching filters.
                </td>
              </tr>
            ) : (
              filteredChanges.map((cr) => {
                const requester = users.find(u => u.id === cr.requesterId);
                return (
                  <tr key={cr.id} className="hover:bg-[#191a1b]/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cr.id)}
                        onChange={() => toggleSelect(cr.id)}
                        className="rounded border-[rgba(255,255,255,0.2)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-[#f7f8f8]">{cr.title}</div>
                      <div className="text-xs text-[#8a8f98] line-clamp-1 max-w-xs">{cr.description}</div>
                    </td>
                    <td className="p-4 capitalize text-xs">{cr.scope}</td>
                    <td className="p-4">
                      <span className={getRiskBadgeClass(cr.riskLevel)}>
                        {cr.riskLevel}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block w-8 text-center font-mono text-xs font-bold py-0.5 rounded ${
                        cr.riskScore > 75 ? 'text-red-400 bg-red-950/30' :
                        cr.riskScore > 45 ? 'text-orange-400 bg-orange-950/30' :
                        'text-emerald-400 bg-emerald-950/30'
                      }`}>
                        {cr.riskScore}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={getStatusBadgeClass(cr.status)}>
                        {cr.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-[#8a8f98]">
                      {requester ? requester.name : 'Unknown'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/changes/${cr.id}`}
                          className="p-1 text-[#8a8f98] hover:text-[#f7f8f8]"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingChange(cr);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-[#8a8f98] hover:text-[#f7f8f8]"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cr.id)}
                          className="p-1 text-[#8a8f98] hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-4 mb-4">
              <h3 className="text-lg font-semibold text-[#f7f8f8]">
                {editingChange ? 'Edit Change Request' : 'New Change Request'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingChange(null);
                }}
                className="text-[#8a8f98] hover:text-[#f7f8f8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  placeholder="e.g., Upgrade Auth Service to v2.1"
                />
                {formErrors.title && <p className="text-xs text-red-400 mt-1">{formErrors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none h-20 resize-none"
                  placeholder="Describe the scope and purpose of the change..."
                />
                {formErrors.description && <p className="text-xs text-red-400 mt-1">{formErrors.description}</p>}
              </div>

              {/* Scope & Risk Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] mb-1">Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as ChangeRequest['scope'] })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="service">Service</option>
                    <option value="database">Database</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="full-stack">Full-Stack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] mb-1">Self-Assessed Risk</label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as ChangeRequest['riskLevel'] })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Impacted Services (Dependencies)</label>
                <div className="max-h-28 overflow-y-auto border border-[rgba(255,255,255,0.08)] bg-[#0f1011] rounded-md p-2 space-y-1">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center gap-2 text-xs text-[#d0d6e0] cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={formData.dependencies.includes(service.id)}
                        onChange={(e) => {
                          const nextDeps = e.target.checked
                            ? [...formData.dependencies, service.id]
                            : formData.dependencies.filter(id => id !== service.id);
                          setFormData({ ...formData, dependencies: nextDeps });
                        }}
                        className="rounded border-[rgba(255,255,255,0.2)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                      />
                      {service.name}
                    </label>
                  ))}
                  {services.length === 0 && (
                    <p className="text-xs text-[#8a8f98] italic">No services configured.</p>
                  )}
                </div>
              </div>

              {/* Rollback Plan */}
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Rollback Plan</label>
                <textarea
                  value={formData.rollbackPlan}
                  onChange={(e) => setFormData({ ...formData, rollbackPlan: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none h-16 resize-none"
                  placeholder="Steps to revert this change if verification fails..."
                />
              </div>

              {/* Requester & Approvers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] mb-1">Requester *</label>
                  <select
                    value={formData.requesterId}
                    onChange={(e) => setFormData({ ...formData, requesterId: e.target.value })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="">Select Requester</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  {formErrors.requesterId && <p className="text-xs text-red-400 mt-1">{formErrors.requesterId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8a8f98] mb-1">Approver *</label>
                  <select
                    value={formData.approverIds[0] || ''}
                    onChange={(e) => setFormData({ ...formData, approverIds: e.target.value ? [e.target.value] : [] })}
                    className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  >
                    <option value="">Select Approver</option>
                    {users.filter(u => u.role === 'approver' || u.role === 'admin').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  {formErrors.approverIds && <p className="text-xs text-red-400 mt-1">{formErrors.approverIds}</p>}
                </div>
              </div>

              {/* Dynamic Risk Score Preview */}
              <div className="rounded-md bg-[#0f1011] p-3 border border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${
                    calculatedRiskScore > 70 ? 'text-red-400' :
                    calculatedRiskScore > 40 ? 'text-orange-400' :
                    'text-emerald-400'
                  }`} />
                  <div>
                    <div className="text-xs font-semibold text-[#f7f8f8]">Calculated Risk Score</div>
                    <div className="text-[10px] text-[#8a8f98]">Based on scope, risk level, and dependencies</div>
                  </div>
                </div>
                <div className={`text-2xl font-bold font-mono ${
                  calculatedRiskScore > 70 ? 'text-red-400' :
                  calculatedRiskScore > 40 ? 'text-orange-400' :
                  'text-emerald-400'
                }`}>
                  {calculatedRiskScore}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingChange(null);
                  }}
                  className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]"
                >
                  {editingChange ? 'Save Changes' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
