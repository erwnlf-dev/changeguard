// FILE: src/app/dashboard/services/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../../lib/store';
import { Service } from '../../../lib/types';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Network, X, Check } from 'lucide-react';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(2, 'Name required (min 2 chars)'),
  owner: z.string().min(2, 'Owner required (min 2 chars)'),
  failureRate: z.number().min(0).max(100),
  dependencies: z.array(z.string()),
});

export default function ServicesPage() {
  const { state, dispatch } = useStore();
  const services = (state.entities.services as Service[]) || [];

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    failureRate: 0,
    dependencies: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setConfirmDeleteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync form when editing changes
  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        owner: editingService.owner,
        failureRate: editingService.failureRate,
        dependencies: editingService.dependencies || [],
      });
    } else {
      setFormData({
        name: '',
        owner: '',
        failureRate: 0,
        dependencies: [],
      });
    }
    setFormErrors({});
  }, [editingService, isModalOpen]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const query = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(query) ||
        s.owner.toLowerCase().includes(query)
      );
    });
  }, [services, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!services.length) return { avgFailure: 0, highRisk: 0 };
    const totalFailure = services.reduce((acc, s) => acc + s.failureRate, 0);
    const highRisk = services.filter((s) => s.failureRate > 15).length;
    return {
      avgFailure: Math.round(totalFailure / services.length),
      highRisk,
    };
  }, [services]);

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = serviceSchema.parse(formData);
      const timestamp = Date.now();

      if (editingService) {
        const updated: Service = {
          ...editingService,
          ...validated,
          updatedAt: timestamp,
        };
        dispatch({
          type: 'UPDATE_ENTITY',
          payload: { entityType: 'services', data: updated },
        });
        dispatch({
          type: 'TOAST',
          payload: { message: `Service ${validated.name} updated`, type: 'success' },
        });
      } else {
        const created: Service = {
          id: `srv_${Math.random().toString(36).substr(2, 9)}`,
          ...validated,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        dispatch({
          type: 'ADD_ENTITY',
          payload: { entityType: 'services', data: created },
        });
        dispatch({
          type: 'TOAST',
          payload: { message: `Service ${validated.name} created`, type: 'success' },
        });
      }
      setIsModalOpen(false);
      setEditingService(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFormErrors(errors);
      }
    }
  };

  // Delete Handlers
  const handleDelete = (id: string) => {
    const service = services.find((s) => s.id === id);
    dispatch({
      type: 'DELETE_ENTITY',
      payload: { entityType: 'services', id },
    });
    dispatch({
      type: 'TOAST',
      payload: { message: `Service ${service?.name || ''} deleted`, type: 'success' },
    });
    setConfirmDeleteId(null);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleBulkDelete = () => {
    if (!confirm('Delete selected services?')) return;
    selectedIds.forEach((id) => {
      dispatch({
        type: 'DELETE_ENTITY',
        payload: { entityType: 'services', id },
      });
    });
    dispatch({
      type: 'TOAST',
      payload: { message: `Deleted ${selectedIds.length} services`, type: 'success' },
    });
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredServices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredServices.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDependency = (depId: string) => {
    setFormData((prev) => {
      const deps = prev.dependencies.includes(depId)
        ? prev.dependencies.filter((id) => id !== depId)
        : [...prev.dependencies, depId];
      return { ...prev, dependencies: deps };
    });
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-[#8a8f98]">Manage microservices and track dependency impact.</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] flex items-center gap-2"
        >
          <Plus size={16} /> Add Service
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-4">
          <div className="text-xs uppercase text-[#8a8f98]">Total Services</div>
          <div className="text-2xl font-bold mt-1">{services.length}</div>
        </div>
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-4">
          <div className="text-xs uppercase text-[#8a8f98]">Avg Failure Rate</div>
          <div className="text-2xl font-bold mt-1 text-[#ef4444]">{stats.avgFailure}%</div>
        </div>
        <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-4">
          <div className="text-xs uppercase text-[#8a8f98]">High Risk Services (&gt;15%)</div>
          <div className="text-2xl font-bold mt-1 text-[#f59e0b]">{stats.highRisk}</div>
        </div>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8a8f98]" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search services... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] pl-9 pr-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
          />
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="w-full sm:w-auto rounded-md bg-[#ef4444] px-4 py-2 text-sm font-medium text-white hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Services Table */}
      <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.05)] bg-[#191a1b]/50">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                      filteredServices.length > 0 &&
                      selectedIds.length === filteredServices.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-[rgba(255,255,255,0.12)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                  />
                </th>
                <th className="p-4 text-xs uppercase text-[#8a8f98] font-semibold">Service Name</th>
                <th className="p-4 text-xs uppercase text-[#8a8f98] font-semibold">Owner</th>
                <th className="p-4 text-xs uppercase text-[#8a8f98] font-semibold">Failure Rate</th>
                <th className="p-4 text-xs uppercase text-[#8a8f98] font-semibold">Dependencies</th>
                <th className="p-4 text-xs uppercase text-[#8a8f98] font-semibold">Last Deployment</th>
                <th className="p-4 text-xs uppercase text-[#8a8f98] font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#8a8f98] text-sm">
                    No services found.
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-[#191a1b]/30 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(service.id)}
                        onChange={() => toggleSelect(service.id)}
                        className="rounded border-[rgba(255,255,255,0.12)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                      />
                    </td>
                    <td className="p-4 font-medium text-[#f7f8f8]">{service.name}</td>
                    <td className="p-4 text-[#d0d6e0] text-sm">{service.owner}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          service.failureRate > 15 ? 'text-[#ef4444]' : 'text-[#10b981]'
                        }`}
                      >
                        {service.failureRate}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {service.dependencies && service.dependencies.length > 0 ? (
                          service.dependencies.map((depId) => {
                            const dep = services.find((s) => s.id === depId);
                            return (
                              <span
                                key={depId}
                                className="rounded-md bg-[#191a1b] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 text-xs font-medium text-[#d0d6e0]"
                              >
                                {dep ? dep.name : 'Unknown'}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-[#62666d]">None</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#8a8f98]">
                      {service.lastDeployment
                        ? new Date(service.lastDeployment).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-[#191a1b] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                        title="Edit Service"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(service.id)}
                        className="p-1.5 rounded-md hover:bg-[#191a1b] text-[#8a8f98] hover:text-[#ef4444] transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dependency Matrix */}
      <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Network className="text-[#5e6ad2]" size={20} />
          <h2 className="text-lg font-semibold">Dependency Matrix</h2>
        </div>
        <p className="text-xs text-[#8a8f98]">
          Visual map of service dependencies. Rows depend on columns.
        </p>
        <div className="overflow-x-auto border border-[rgba(255,255,255,0.05)] rounded-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.05)] bg-[#191a1b]/50">
                <th className="p-3 text-xs uppercase text-[#8a8f98] font-semibold bg-[#0f1011] sticky left-0 z-10 border-r border-[rgba(255,255,255,0.05)]">
                  Service
                </th>
                {services.map((s) => (
                  <th
                    key={s.id}
                    className="p-3 text-xs uppercase text-[#8a8f98] font-semibold text-center min-w-[100px]"
                  >
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={services.length + 1} className="p-6 text-center text-[#8a8f98] text-sm">
                    No services to map.
                  </td>
                </tr>
              ) : (
                services.map((rowService) => (
                  <tr key={rowService.id} className="hover:bg-[#191a1b]/30">
                    <td className="p-3 font-medium text-sm text-[#f7f8f8] bg-[#0f1011] sticky left-0 z-10 border-r border-[rgba(255,255,255,0.05)]">
                      {rowService.name}
                    </td>
                    {services.map((colService) => {
                      const isSelf = rowService.id === colService.id;
                      const isDependent = rowService.dependencies?.includes(colService.id);
                      return (
                        <td key={colService.id} className="p-3 text-center">
                          {isSelf ? (
                            <span className="text-[#62666d] text-xs">-</span>
                          ) : isDependent ? (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5e6ad2]" title={`${rowService.name} depends on ${colService.name}`} />
                          ) : (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.05)]" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingService(null);
                }}
                className="text-[#8a8f98] hover:text-[#f7f8f8]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Service Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  placeholder="e.g. auth-service"
                />
                {formErrors.name && <p className="text-xs text-[#ef4444] mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Owner / Team</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  placeholder="e.g. Platform Team"
                />
                {formErrors.owner && <p className="text-xs text-[#ef4444] mt-1">{formErrors.owner}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Failure Rate (%)</label>
                <input
                  type="number"
                  value={formData.failureRate}
                  onChange={(e) => setFormData({ ...formData, failureRate: Number(e.target.value) })}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                  min="0"
                  max="100"
                />
                {formErrors.failureRate && (
                  <p className="text-xs text-[#ef4444] mt-1">{formErrors.failureRate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8a8f98] mb-1">Dependencies</label>
                <div className="max-h-32 overflow-y-auto border border-[rgba(255,255,255,0.08)] bg-[#0f1011] rounded-md p-2 space-y-1">
                  {services
                    .filter((s) => !editingService || s.id !== editingService.id)
                    .map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#191a1b] cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.dependencies.includes(s.id)}
                          onChange={() => toggleDependency(s.id)}
                          className="rounded border-[rgba(255,255,255,0.12)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                        />
                        <span>{s.name}</span>
                      </label>
                    ))}
                  {services.filter((s) => !editingService || s.id !== editingService.id).length === 0 && (
                    <p className="text-xs text-[#62666d] p-2">No other services available.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingService(null);
                  }}
                  className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-[#ef4444]">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold">Delete Service</h3>
            </div>
            <p className="text-sm text-[#d0d6e0]">
              Are you sure you want to delete this service? This action cannot be undone and will remove it from all dependency maps.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="rounded-md bg-[#ef4444] px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
