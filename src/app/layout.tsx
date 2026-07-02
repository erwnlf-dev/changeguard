// FILE: src/app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import { useState, useEffect, createContext } from 'react';
import { StoreProvider } from './store';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const LanguageContext = createContext({
  lang: 'en',
  setLang: (lang: 'en' | 'id') => {},
  t: (key: string) => key,
});

const dict = {
  en: {
    cookieText: 'We use cookies to analyze risk and optimize deployments.',
    accept: 'Accept',
    helpTitle: 'Help & Feedback',
    helpBody: 'Need assistance? Contact support@changeguard.io or check docs.',
    changelog: "What's New",
  },
  id: {
    cookieText: 'Kami menggunakan cookie untuk menganalisis risiko dan mengoptimalkan penyebaran.',
    accept: 'Terima',
    helpTitle: 'Bantuan & Umpan Balik',
    helpBody: 'Butuh bantuan? Hubungi support@changeguard.io atau cek dokumentasi.',
    changelog: 'Catatan Rilis',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [consent, setConsent] = useState<boolean>(true);

  useEffect(() => {
    // i18n
    const savedLang = localStorage.getItem('lang') as 'en' | 'id';
    if (savedLang) setLang(savedLang);

    // GDPR
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) setConsent(false);

    // Affiliate/Referral
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('ref', ref);

    // A/B Testing
    if (!localStorage.getItem('ab-variant')) {
      localStorage.setItem('ab-variant', Math.random() > 0.5 ? 'A' : 'B');
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsent(true);
  };

  const changeLang = (newLang: 'en' | 'id') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: string) => {
    return (dict[lang] as any)[key] || key;
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
    <html lang={lang} className={inter.className}>
      <head>
        <title>ChangeGuard - Change Risk Scoring & Approval Platform</title>
        <meta name="description" content="Automated risk analysis based on deployment patterns, dependency impact, and historical failure data." />
        <meta property="og:title" content="ChangeGuard - Change Risk Scoring & Approval Platform" />
        <meta property="og:description" content="Automated risk analysis based on deployment patterns, dependency impact, and historical failure data." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#08090a] text-[#f7f8f8] antialiased">
        <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
          <StoreProvider>
            {children}

            {/* Language Toggle */}
            <div className="fixed bottom-4 left-4 z-50 flex gap-1 rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-1 text-xs">
              <button
                onClick={() => changeLang('en')}
                className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-[#5e6ad2] text-white' : 'text-[#8a8f98]'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLang('id')}
                className={`px-2 py-1 rounded ${lang === 'id' ? 'bg-[#5e6ad2] text-white' : 'text-[#8a8f98]'}`}
              >
                ID
              </button>
            </div>

            {/* GDPR Cookie Consent */}
            {!consent && (
              <div className="fixed bottom-4 left-1/2 z-50 w-11/12 max-w-md -translate-x-1/2 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#0f1011] p-4 shadow-xl">
                <p className="text-sm text-[#d0d6e0] mb-3">{t('cookieText')}</p>
                <button
                  onClick={handleAcceptCookies}
                  className="w-full rounded-md bg-[#5e6ad2] py-2 text-sm font-medium text-white hover:bg-[#828fff]"
                >
                  {t('accept')}
                </button>
              </div>
            )}

            {/* Floating Help & Feedback Widget */}
            <details className="fixed bottom-4 right-4 z-50 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#191a1b] p-3 text-sm text-[#d0d6e0] shadow-lg max-w-xs">
              <summary className="cursor-pointer font-medium text-[#f7f8f8] select-none">
                {t('helpTitle')}
              </summary>
              <div className="mt-2 space-y-2">
                <p className="text-xs text-[#8a8f98]">{t('helpBody')}</p>
                <div className="border-t border-[rgba(255,255,255,0.05)] pt-2">
                  <span className="text-xs font-semibold text-[#5e6ad2] block mb-1">{t('changelog')}</span>
                  <p className="text-[11px] text-[#8a8f98]">v1.0.4 - Added multi-language support & risk simulation engine.</p>
                </div>
              </div>
            </details>
          </StoreProvider>
        </LanguageContext.Provider>
      </body>
    </html>
  );
}
