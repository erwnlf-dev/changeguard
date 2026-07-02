// FILE: src/app/dashboard/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Shield, 
  HelpCircle, 
  Globe, 
  Search,
  X
} from 'lucide-react';
import { StoreProvider } from '@/context/store';

const dict = {
  en: {
    dashboard: 'Dashboard',
    changes: 'Change Requests',
    settings: 'Settings',
    searchPlaceholder: 'Search or type command...',
    searchShortcut: 'Ctrl+K',
    gdprText: 'We use cookies to optimize change risk scoring.',
    accept: 'Accept',
    helpTitle: 'ChangeGuard Help',
    helpText: 'Need assistance? Email support@changeguard.io',
    abVariant: 'A/B Variant:',
    refDetected: 'Referral code saved:'
  },
  id: {
    dashboard: 'Dasbor',
    changes: 'Permintaan Perubahan',
    settings: 'Pengaturan',
    searchPlaceholder: 'Cari atau ketik perintah...',
    searchShortcut: 'Ctrl+K',
    gdprText: 'Kami menggunakan cookie untuk mengoptimalkan penilaian risiko.',
    accept: 'Setuju',
    helpTitle: 'Bantuan ChangeGuard',
    helpText: 'Butuh bantuan? Email support@changeguard.io',
    abVariant: 'Varian A/B:',
    refDetected: 'Kode referal disimpan:'
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [showConsent, setShowConsent] = useState(false);
  const [abVariant, setAbVariant] = useState('A');
  const [refCode, setRefCode] = useState<string | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  useEffect(() => {
    // i18n
    const savedLang = localStorage.getItem('lang') as 'en' | 'id';
    if (savedLang) setLang(savedLang);

    // GDPR
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShowConsent(true);

    // A/B Testing
    let variant = localStorage.getItem('ab-variant');
    if (!variant) {
      variant = Math.random() > 0.5 ? 'B' : 'A';
      localStorage.setItem('ab-variant', variant);
    }
    setAbVariant(variant);

    // Referral
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('ref', ref);
      setRefCode(ref);
    } else {
      setRefCode(localStorage.getItem('ref'));
    }

    // Keyboard shortcut Cmd/Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'id' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const acceptConsent = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  const t = dict[lang];

  const navItems = [
    { href: '/dashboard', label: t.dashboard, icon: LayoutDashboard },
    { href: '/dashboard/changes', label: t.changes, icon: FileText },
    { href: '/dashboard/settings', label: t.settings, icon: Settings },
  ];

  const commands = [
    { name: t.dashboard, action: () => router.push('/dashboard') },
    { name: t.changes, action: () => router.push('/dashboard/changes') },
    { name: t.settings, action: () => router.push('/dashboard/settings') },
    { name: 'Toggle Language', action: toggleLang },
  ];

  const filteredCommands = commands.filter(c => 
    c.name.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-60 border-r border-[rgba(255,255,255,0.05)] bg-[#0f1011] flex flex-col justify-between z-20">
          <div>
            <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)] gap-2">
              <Shield className="h-6 w-6 text-[#5e6ad2]" />
              <span className="font-bold text-lg tracking-tight">ChangeGuard</span>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active 
                        ? 'bg-[#191a1b] text-[#f7f8f8] border-l-2 border-[#5e6ad2]' 
                        : 'text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-[#0f1011]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.05)] space-y-2 text-xs text-[#8a8f98]">
            <div className="flex items-center justify-between">
              <span>{t.abVariant} <strong>{abVariant}</strong></span>
              <button 
                onClick={toggleLang} 
                className="flex items-center gap-1 hover:text-[#f7f8f8] transition-colors"
              >
                <Globe className="h-3 w-3" />
                {lang.toUpperCase()}
              </button>
            </div>
            {refCode && (
              <div className="truncate">
                {t.refDetected} <span className="text-[#5e6ad2]">{refCode}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="pl-60 flex-1 flex flex-col min-h-screen">
          {/* Topbar */}
          <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[#0f1011] flex items-center justify-between px-8 sticky top-0 z-10">
            <button 
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] text-sm text-[#8a8f98] hover:text-[#f7f8f8] w-64 transition-colors text-left"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1">{t.searchPlaceholder}</span>
              <kbd className="text-[10px] bg-[#08090a] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.1)]">{t.searchShortcut}</kbd>
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">Admin User</div>
                <div className="text-xs text-[#8a8f98]">Platform Team</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#5e6ad2] flex items-center justify-center font-bold text-sm text-white">
                A
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-8 bg-[#08090a]">
            {children}
          </main>
        </div>

        {/* Command Palette Modal */}
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-3">
                <Search className="h-5 w-5 text-[#8a8f98]" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={cmdQuery}
                  onChange={e => setCmdQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#f7f8f8] focus:outline-none"
                  autoFocus
                />
                <button onClick={() => setCmdOpen(false)} className="text-[#8a8f98] hover:text-[#f7f8f8]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        cmd.action();
                        setCmdOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-sm text-[#d0d6e0] hover:bg-[#5e6ad2] hover:text-white transition-colors"
                    >
                      {cmd.name}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-[#8a8f98] text-center">No results found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Help Widget */}
        <div className="fixed bottom-4 right-4 z-40">
          <details className="group bg-[#0f1011] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-lg overflow-hidden max-w-xs">
            <summary className="list-none flex items-center justify-between p-3 cursor-pointer select-none text-sm font-medium text-[#d0d6e0] hover:text-[#f7f8f8]">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#5e6ad2]" />
                {t.helpTitle}
              </span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="p-3 border-t border-[rgba(255,255,255,0.05)] text-xs text-[#8a8f98] bg-[#191a1b]">
              <p>{t.helpText}</p>
            </div>
          </details>
        </div>

        {/* GDPR Cookie Consent Banner */}
        {showConsent && (
          <div className="fixed bottom-4 left-4 z-40 max-w-sm bg-[#0f1011] border border-[rgba(255,255,255,0.08)] p-4 rounded-lg shadow-lg flex flex-col gap-3">
            <p className="text-xs text-[#d0d6e0]">{t.gdprText}</p>
            <button 
              onClick={acceptConsent}
              className="w-full rounded-md bg-[#5e6ad2] py-1.5 text-xs font-medium text-white hover:bg-[#828fff] transition-colors"
            >
              {t.accept}
            </button>
          </div>
        )}
      </div>
    </StoreProvider>
  );
}

// Layout wrapper created → skipped: server-side session sync, add when auth provider integrated.