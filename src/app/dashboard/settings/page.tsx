// FILE: src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Save, Download, Upload, Trash2, ShieldAlert, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { dispatch } = useStore();
  
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [rules, setRules] = useState({ maxRisk: 80, autoApprove: 30, emailAlerts: true, slackAlerts: false });

  useEffect(() => {
    const savedProfile = localStorage.getItem('cg_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    const savedRules = localStorage.getItem('cg_rules');
    if (savedRules) setRules(JSON.parse(savedRules));
  }, []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cg_profile', JSON.stringify(profile));
    dispatch({ type: 'TOAST', payload: { message: 'Profile updated', type: 'success' } });
  };

  const saveRules = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cg_rules', JSON.stringify(rules));
    dispatch({ type: 'TOAST', payload: { message: 'Rules updated', type: 'success' } });
  };

  const exportData = () => {
    const keys = ['app_changeRequests', 'app_services', 'app_users', 'app_metrics', 'app_auditLogs', 'cg_profile', 'cg_rules'];
    const data: Record<string, any> = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) data[k] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changeguard-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'TOAST', payload: { message: 'Data exported', type: 'success' } });
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        Object.entries(data).forEach(([k, v]) => {
          localStorage.setItem(k, JSON.stringify(v));
        });
        // ponytail: assume store handles SEED payload mapping directly to state entities
        dispatch({ type: 'SEED', payload: data });
        dispatch({ type: 'TOAST', payload: { message: 'Data imported successfully', type: 'success' } });
        window.location.reload();
      } catch (err) {
        dispatch({ type: 'TOAST', payload: { message: 'Invalid backup file', type: 'danger' } });
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (!confirm('Clear all data? This cannot be undone.')) return;
    localStorage.clear();
    dispatch({ type: 'SEED', payload: {} });
    dispatch({ type: 'TOAST', payload: { message: 'System reset to defaults', type: 'success' } });
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#f7f8f8]">Settings</h1>
        <p className="text-sm text-[#8a8f98]">Configure thresholds, rules, and manage system data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile */}
        <form onSubmit={saveProfile} className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5 space-y-4">
          <h2 className="text-lg font-medium text-[#f7f8f8]">User Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#8a8f98] mb-1">Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8a8f98] mb-1">Email</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]">
            <Save size={16} /> Save Profile
          </button>
        </form>

        {/* Risk Thresholds & Rules */}
        <form onSubmit={saveRules} className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5 space-y-4">
          <h2 className="text-lg font-medium text-[#f7f8f8] flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#5e6ad2]" /> Risk Gates
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#8a8f98] mb-1">Blocking Risk Score Threshold (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={rules.maxRisk}
                onChange={e => setRules({ ...rules, maxRisk: parseInt(e.target.value) || 80 })}
                className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8a8f98] mb-1">Auto-Approve Threshold (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={rules.autoApprove}
                onChange={e => setRules({ ...rules, autoApprove: parseInt(e.target.value) || 30 })}
                className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
              />
            </div>
          </div>
          <button type="submit" className="flex items-center gap-2 rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]">
            <Save size={16} /> Save Rules
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5 space-y-4">
        <h2 className="text-lg font-medium text-[#f7f8f8] flex items-center gap-2">
          <Bell size={18} className="text-[#5e6ad2]" /> Notification Channels
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.emailAlerts}
              onChange={e => {
                const updated = { ...rules, emailAlerts: e.target.checked };
                setRules(updated);
                localStorage.setItem('cg_rules', JSON.stringify(updated));
              }}
              className="rounded border-[rgba(255,255,255,0.08)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
            />
            <span className="text-sm text-[#d0d6e0]">Email alerts for high-risk deployments</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.slackAlerts}
              onChange={e => {
                const updated = { ...rules, slackAlerts: e.target.checked };
                setRules(updated);
                localStorage.setItem('cg_rules', JSON.stringify(updated));
              }}
              className="rounded border-[rgba(255,255,255,0.08)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
            />
            <span className="text-sm text-[#d0d6e0]">Slack webhook notifications on status change</span>
          </label>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-5 space-y-4">
        <h2 className="text-lg font-medium text-[#f7f8f8]">System Data Management</h2>
        <p className="text-xs text-[#8a8f98]">Export system state, import backups, or wipe all local storage data.</p>
        
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b]"
          >
            <Download size={16} /> Export Backup
          </button>

          <label className="flex items-center gap-2 rounded-md border border-[rgba(255,255,255,0.08)] px-4 py-2 text-sm text-[#d0d6e0] hover:bg-[#191a1b] cursor-pointer">
            <Upload size={16} /> Import Backup
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>

          <button
            onClick={resetData}
            className="flex items-center gap-2 rounded-md bg-[#ef4444] px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            <Trash2 size={16} /> Reset System
          </button>
        </div>
      </div>
    </div>
  );
}

// ponytail: validation is basic HTML5 constraints. Upgrade to Zod schema if API integration is added.