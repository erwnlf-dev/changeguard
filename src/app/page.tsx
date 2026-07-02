// FILE: src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Zap, 
  GitBranch, 
  Layers, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  Check, 
  X 
} from 'lucide-react';

// i18n Dictionary
const dict = {
  en: {
    title: "ChangeGuard",
    tagline: "Automated change risk scoring for DevOps.",
    heroDesc: "Stop guessing. Analyze deployment risk, map dependencies, and automate approvals based on historical failure patterns.",
    calcTitle: "Risk Calculator Demo",
    calcDesc: "Estimate risk score before you deploy.",
    scope: "Scope",
    rollback: "Rollback Plan?",
    deps: "Dependencies",
    failRate: "Service Failure Rate",
    calcBtn: "Calculate Risk Score",
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    cta: "Ready to secure your pipeline?",
    ctaDesc: "Start scoring change requests in minutes. No credit card required.",
    emailPlaceholder: "Enter your work email",
    subscribe: "Get Started",
    cookieText: "We use cookies to analyze traffic and optimize your experience.",
    accept: "Accept",
    decline: "Decline",
    lang: "ID",
  },
  id: {
    title: "ChangeGuard",
    tagline: "Skor risiko perubahan otomatis untuk DevOps.",
    heroDesc: "Berhenti menebak. Analisis risiko penerapan, petakan dependensi, dan otomatisasi persetujuan berdasarkan pola kegagalan historis.",
    calcTitle: "Demo Kalkulator Risiko",
    calcDesc: "Perkirakan skor risiko sebelum Anda menerapkan.",
    scope: "Cakupan",
    rollback: "Rencana Rollback?",
    deps: "Dependensi",
    failRate: "Tingkat Kegagalan Layanan",
    calcBtn: "Hitung Skor Risiko",
    features: "Fitur",
    pricing: "Harga",
    faq: "Pertanyaan Umum",
    cta: "Siap mengamankan pipeline Anda?",
    ctaDesc: "Mulai nilai permintaan perubahan dalam hitungan menit. Tanpa kartu kredit.",
    emailPlaceholder: "Masukkan email kerja Anda",
    subscribe: "Mulai Sekarang",
    cookieText: "Kami menggunakan cookie untuk menganalisis lalu lintas dan mengoptimalkan pengalaman Anda.",
    accept: "Terima",
    decline: "Tolak",
    lang: "EN",
  }
};

export default function LandingPage() {
  // i18n
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const t = dict[lang];

  // A/B Testing
  const [heroVariant, setHeroVariant] = useState<'A' | 'B'>('A');

  // GDPR Cookie Consent
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Email Capture
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Risk Calculator State
  const [scope, setScope] = useState<'service' | 'database' | 'infrastructure' | 'full-stack'>('service');
  const [hasRollback, setHasRollback] = useState(true);
  const [depsCount, setDepsCount] = useState<number>(1);
  const [failureRate, setFailureRate] = useState<'low' | 'medium' | 'high'>('low');
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  useEffect(() => {
    // Referral Tracking
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('changeguard_ref', ref);
    }

    // A/B Test Assignment
    const variant = localStorage.getItem('changeguard_hero_variant') as 'A' | 'B';
    if (variant) {
      setHeroVariant(variant);
    } else {
      const newVariant = Math.random() > 0.5 ? 'A' : 'B';
      localStorage.setItem('changeguard_hero_variant', newVariant);
      setHeroVariant(newVariant);
    }

    // GDPR Consent Check
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleCookieConsent = (accept: boolean) => {
    localStorage.setItem('cookie-consent', accept ? 'accepted' : 'declined');
    setShowCookieBanner(false);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const emails = JSON.parse(localStorage.getItem('app_subscribed_emails') || '[]');
    emails.push({ email, timestamp: Date.now() });
    localStorage.setItem('app_subscribed_emails', JSON.stringify(emails));
    setSubscribed(true);
    setEmail('');
  };

  const calculateRisk = () => {
    let score = 20;

    // Scope modifier
    if (scope === 'database') score += 25;
    if (scope === 'infrastructure') score += 30;
    if (scope === 'full-stack') score += 40;

    // Rollback modifier
    if (!hasRollback) score += 20;

    // Dependencies modifier
    score += Math.min(depsCount * 8, 25);

    // Failure rate modifier
    if (failureRate === 'medium') score += 10;
    if (failureRate === 'high') score += 20;

    setCalculatedScore(Math.min(Math.max(score, 1), 100));
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ChangeGuard',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Cloud-native change risk scoring and approval workflow platform for DevOps and IT teams.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f7f8f8] font-sans antialiased selection:bg-[#5e6ad2]/30 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.05)] bg-[#08090a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#5e6ad2]" />
            <span className="text-lg font-semibold tracking-tight text-white">ChangeGuard</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#8a8f98]">
            <a href="#features" className="hover:text-[#f7f8f8] transition-colors">{t.features}</a>
            <a href="#calculator" className="hover:text-[#f7f8f8] transition-colors">Calculator</a>
            <a href="#pricing" className="hover:text-[#f7f8f8] transition-colors">{t.pricing}</a>
            <a href="#faq" className="hover:text-[#f7f8f8] transition-colors">{t.faq}</a>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
              className="flex items-center gap-1 rounded-md border border-[rgba(255,255,255,0.08)] px-2.5 py-1 text-xs text-[#d0d6e0] hover:bg-[#191a1b]"
            >
              <Globe className="h-3 w-3" />
              {t.lang}
            </button>
            <Link 
              href="/dashboard" 
              className="rounded-md bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] transition-colors"
            >
              Console
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#5e6ad2]/10 via-transparent to-transparent opacity-70" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5e6ad2]/30 bg-[#5e6ad2]/10 px-3 py-1 text-xs font-medium text-[#7170ff]">
                <span className="flex h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                v1.2.0 Live: Dependency Mapping
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {heroVariant === 'A' ? t.tagline : "Zero-incident deployments start here."}
              </h1>
              <p className="text-lg text-[#d0d6e0] max-w-xl">
                {t.heroDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#5e6ad2] px-6 py-3 text-base font-medium text-white hover:bg-[#828fff] transition-colors"
                >
                  Launch Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <a 
                  href="#calculator" 
                  className="inline-flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-6 py-3 text-base font-medium text-[#d0d6e0] hover:bg-[#191a1b] transition-colors"
                >
                  Try Calculator
                </a>
              </div>
            </div>

            {/* Interactive Risk Calculator Demo */}
            <div id="calculator" className="lg:col-span-5">
              <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0f1011] p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-white">{t.calcTitle}</h3>
                <p className="text-xs text-[#8a8f98] mb-4">{t.calcDesc}</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8a8f98] mb-1">{t.scope}</label>
                    <select 
                      value={scope} 
                      onChange={(e) => setScope(e.target.value as any)}
                      className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-3 py-2 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                    >
                      <option value="service">Service (Microservice)</option>
                      <option value="database">Database Schema Change</option>
                      <option value="infrastructure">Infrastructure (IaC)</option>
                      <option value="full-stack">Full-Stack Deployment</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#8a8f98]">{t.rollback}</label>
                    <input 
                      type="checkbox" 
                      checked={hasRollback} 
                      onChange={(e) => setHasRollback(e.target.checked)}
                      className="h-4 w-4 rounded border-[rgba(255,255,255,0.08)] bg-[#191a1b] text-[#5e6ad2] focus:ring-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8a8f98] mb-1">{t.deps} ({depsCount})</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      value={depsCount} 
                      onChange={(e) => setDepsCount(parseInt(e.target.value))}
                      className="w-full accent-[#5e6ad2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8a8f98] mb-1">{t.failRate}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setFailureRate(rate)}
                          className={`rounded-md border py-1.5 text-xs font-medium capitalize transition-colors ${
                            failureRate === rate 
                              ? 'border-[#5e6ad2] bg-[#5e6ad2]/10 text-white' 
                              : 'border-[rgba(255,255,255,0.08)] bg-[#191a1b] text-[#8a8f98] hover:text-white'
                          }`}
                        >
                          {rate}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={calculateRisk}
                    className="w-full rounded-md bg-[#5e6ad2] py-2.5 text-sm font-medium text-white hover:bg-[#828fff] transition-colors"
                  >
                    {t.calcBtn}
                  </button>

                  {calculatedScore !== null && (
                    <div className="mt-4 rounded-md bg-[#191a1b] p-4 text-center border border-[rgba(255,255,255,0.05)]">
                      <span className="block text-xs text-[#8a8f98] uppercase tracking-wider">Calculated Risk Score</span>
                      <span className={`text-4xl font-bold ${
                        calculatedScore > 70 ? 'text-[#ef4444]' : calculatedScore > 40 ? 'text-[#f59e0b]' : 'text-[#10b981]'
                      }`}>
                        {calculatedScore} / 100
                      </span>
                      <span className="block text-xs text-[#8a8f98] mt-1">
                        {calculatedScore > 70 ? 'Requires Admin Approval' : calculatedScore > 40 ? 'Requires Peer Approval' : 'Auto-approvable'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-[rgba(255,255,255,0.05)] bg-[#0f1011]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for high-velocity engineering teams
            </h2>
            <p className="mt-4 text-[#8a8f98]">
              Ditch slow CAB meetings. Automate safety gates with data-driven risk analysis.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <div className="mb-4 inline-block rounded-md bg-[#5e6ad2]/10 p-3 text-[#5e6ad2]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Risk Scoring</h3>
              <p className="text-sm text-[#8a8f98]">
                Instant 1-100 risk score calculated from deployment scope, rollback plans, and historical metrics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <div className="mb-4 inline-block rounded-md bg-[#5e6ad2]/10 p-3 text-[#5e6ad2]">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Dependency Impact Analysis</h3>
              <p className="text-sm text-[#8a8f98]">
                Automatically map upstream and downstream services to prevent cascading failures during deploys.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <div className="mb-4 inline-block rounded-md bg-[#5e6ad2]/10 p-3 text-[#5e6ad2]">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Stage Workflows</h3>
              <p className="text-sm text-[#8a8f98]">
                Configure custom approval gates, auto-escalation rules, and conditional bypasses for low-risk changes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <div className="mb-4 inline-block rounded-md bg-[#5e6ad2]/10 p-3 text-[#5e6ad2]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Failure Pattern Analytics</h3>
              <p className="text-sm text-[#8a8f98]">
                Identify root causes and correlate deployment frequency with incident rates across all services.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <div className="mb-4 inline-block rounded-md bg-[#5e6ad2]/10 p-3 text-[#5e6ad2]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Blocking Rules</h3>
              <p className="text-sm text-[#8a8f98]">
                Define hard organizational thresholds to block critical-risk changes during freeze windows.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <div className="mb-4 inline-block rounded-md bg-[#5e6ad2]/10 p-3 text-[#5e6ad2]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Compliance Reporting</h3>
              <p className="text-sm text-[#8a8f98]">
                Generate audit-ready reports filtered by team, risk level, or time period in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-t border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-white">Trusted by engineering leaders</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <p className="text-sm text-[#d0d6e0] italic">
                "ChangeGuard reduced our deployment incidents by 40% in the first month. The dependency mapping is a lifesaver."
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-white">Sarah Jenkins</p>
                <p className="text-[10px] text-[#8a8f98]">VP of Infrastructure, CloudScale</p>
              </div>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <p className="text-sm text-[#d0d6e0] italic">
                "We replaced our clunky ITSM tool with ChangeGuard. Approvals are now automated based on actual risk data."
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-white">Marcus Chen</p>
                <p className="text-[10px] text-[#8a8f98]">Director of DevOps, FinTech Flow</p>
              </div>
            </div>
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-6">
              <p className="text-sm text-[#d0d6e0] italic">
                "Audit season used to be a nightmare. Now we just export ChangeGuard compliance reports and we are done."
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold text-white">Elena Rostova</p>
                <p className="text-[10px] text-[#8a8f98]">Head of Security & Compliance, HealthSync</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-[rgba(255,255,255,0.05)] bg-[#0f1011]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-[#8a8f98]">Choose the plan that fits your team size and compliance needs.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Free */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Free</h3>
                <p className="text-xs text-[#8a8f98] mt-1">For individual developers and small projects.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-xs text-[#8a8f98] ml-2">/ month</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-[#d0d6e0]">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> 1 User</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Basic Risk Scoring</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Up to 100 changes/mo</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Community Support</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 block w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] py-2 text-center text-sm font-medium text-white hover:bg-[#191a1b]/80">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-lg border-2 border-[#5e6ad2] bg-[#0f1011] p-8 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5e6ad2] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Pro</h3>
                <p className="text-xs text-[#8a8f98] mt-1">For growing engineering teams.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-xs text-[#8a8f98] ml-2">/ month</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-[#d0d6e0]">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Up to 5 Users</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Advanced Risk Scoring</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Unlimited changes</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Dependency Mapping</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Email Support</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 block w-full rounded-md bg-[#5e6ad2] py-2 text-center text-sm font-medium text-white hover:bg-[#828fff]">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0f1011] p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Enterprise</h3>
                <p className="text-xs text-[#8a8f98] mt-1">For large organizations requiring strict compliance.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-bold text-white">$99</span>
                  <span className="text-xs text-[#8a8f98] ml-2">/ month</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-[#d0d6e0]">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Unlimited Users</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Custom Risk Rules</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> SSO / SAML Integration</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Priority 24/7 Support</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#10b981]" /> Full API Access</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 block w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] py-2 text-center text-sm font-medium text-white hover:bg-[#191a1b]/80">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-[rgba(255,255,255,0.05)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <div>
              <h4 className="text-base font-semibold text-white mb-2">How is the risk score calculated?</h4>
              <p className="text-sm text-[#8a8f98]">
                Our algorithm evaluates deployment scope, rollback plan availability, dependency count, and historical failure rates of the target services to output a score from 1 to 100.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-2">Can we integrate this with GitHub Actions or GitLab CI?</h4>
              <p className="text-sm text-[#8a8f98]">
                Yes. Enterprise plans include full API access to query risk scores and trigger approval gates directly from your CI/CD pipelines.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-2">What is dependency mapping?</h4>
              <p className="text-sm text-[#8a8f98]">
                It visualizes connections between services. If you deploy a change to Service A, ChangeGuard alerts you if Service B or C (which depend on A) are at risk.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-2">Is my deployment data secure?</h4>
              <p className="text-sm text-[#8a8f98]">
                Absolutely. We only store metadata about your changes (scope, service names, status). We never access your source code or production environments.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-2">Do you support SSO/SAML?</h4>
              <p className="text-sm text-[#8a8f98]">
                Yes, single sign-on (SSO) via Okta, Azure AD, and Google Workspace is available on our Enterprise plan.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-2">Can I export compliance reports?</h4>
              <p className="text-sm text-[#8a8f98]">
                Yes, you can generate and download PDF/JSON compliance reports filtered by date, team, or risk level directly from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[rgba(255,255,255,0.05)] bg-[#0f1011]/30 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-[#5e6ad2]/5 via-transparent to-transparent opacity-50" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.cta}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[#8a8f98]">{t.ctaDesc}</p>
          
          <div className="mt-8 max-w-md mx-auto">
            {subscribed ? (
              <div className="rounded-md bg-[#10b981]/10 border border-[#10b981]/30 p-4 text-sm text-[#10b981]">
                Thanks for subscribing! We'll reach out shortly.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-4 py-2.5 text-sm text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-[#5e6ad2] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#828fff] transition-colors"
                >
                  {t.subscribe}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] bg-[#08090a] py-12 text-xs text-[#8a8f98]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#5e6ad2]" />
            <span className="font-semibold text-white">ChangeGuard</span>
            <span>© {new Date().getFullYear()} ChangeGuard Inc.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>

      {/* GDPR Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-4 shadow-2xl">
          <p className="text-xs text-[#d0d6e0] mb-3">{t.cookieText}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleCookieConsent(false)}
              className="rounded px-3 py-1.5 text-[10px] font-medium text-[#8a8f98] hover:text-white transition-colors"
            >
              {t.decline}
            </button>
            <button
              onClick={() => handleCookieConsent(true)}
              className="rounded bg-[#5e6ad2] px-3 py-1.5 text-[10px] font-medium text-white hover:bg-[#828fff] transition-colors"
            >
              {t.accept}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// landing page code complete → skipped: actual email API integration, add when production mailer is configured.