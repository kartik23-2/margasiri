'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { CATEGORY_OPTIONS } from '@/lib/categories';
import { localizedCategory } from '@/lib/localizedContent';

interface StateOption {
  name: string;
  slug: string;
  count: number;
}

interface Props {
  open: boolean;
  states: StateOption[];
  stateFilter: string;
  categoryFilters: string[];
  onClose: () => void;
  onApply: (filters: { state: string; categories: string[] }) => void;
}

export default function FilterSheet({ open, states, stateFilter, categoryFilters, onClose, onApply }: Props) {
  const { lang, tr } = useLanguage();
  const [draftState, setDraftState] = useState(stateFilter);
  const [draftCategories, setDraftCategories] = useState<string[]>(categoryFilters);

  useEffect(() => {
    if (!open) return;
    setDraftState(stateFilter);
    setDraftCategories(categoryFilters);
  }, [categoryFilters, open, stateFilter]);

  if (!open) return null;

  function toggleCategory(category: string) {
    setDraftCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/40" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} aria-label={tr('closeFilters')} />
      <section className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-auto rounded-t-3xl bg-paper-light p-5 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-black/20" />
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-50">{tr('explore')}</p>
            <h2 className="font-display text-3xl">{tr('filters')}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-black/10 bg-paper p-2" aria-label={tr('close')}>
            <X size={18} />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-xs uppercase tracking-widest opacity-50">{tr('state')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDraftState('')}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${!draftState ? 'border-indigo bg-indigo text-paper-light' : 'border-black/10 bg-white'}`}
            >
              {tr('allStates')}
            </button>
            {states.map((state) => (
              <button
                key={state.slug}
                type="button"
                onClick={() => setDraftState(state.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${draftState === state.slug ? 'border-indigo bg-indigo text-paper-light' : 'border-black/10 bg-white'}`}
              >
                {state.name} ({state.count})
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-widest opacity-50">{tr('categories')}</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((category) => {
              const active = draftCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? 'border-indigo bg-indigo text-paper-light' : 'border-black/10 bg-white'}`}
                >
                  {localizedCategory(lang, category)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-black/10 bg-paper-light p-5">
          <button
            type="button"
            onClick={() => onApply({ state: draftState, categories: draftCategories })}
            className="w-full rounded-xl bg-vermillion px-5 py-3 text-sm font-semibold text-white"
          >
            {tr('showResults')}
          </button>
        </div>
      </section>
    </div>
  );
}
