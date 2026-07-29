'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANG_LABELS, t, type Lang } from '@/lib/i18n';

const STORAGE_KEY = 'margasiri:language';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  tr: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(value: string | null): value is Lang {
  return value === 'en' || value === 'hi' || value === 'kn';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) setLangState(stored);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }

  const value = useMemo(() => ({ lang, setLang, tr: (key: string) => t(lang, key) }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex rounded-full border border-black/10 bg-paper-light p-1" aria-label="Language">
      {(Object.keys(LANG_LABELS) as Lang[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLang(item)}
          title={LANG_LABELS[item]}
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${lang === item ? 'bg-indigo text-paper-light' : 'text-ink/65'}`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function T({ k, as: Component = 'span' }: { k: string; as?: keyof JSX.IntrinsicElements }) {
  const { tr } = useLanguage();
  return <Component>{tr(k)}</Component>;
}
