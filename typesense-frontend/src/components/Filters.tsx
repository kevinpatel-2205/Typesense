// src/components/Filters.tsx

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilter, resetFilters } from '../store/searchSlice';
import type { SearchState } from '../types';

const CATEGORIES = ['Restaurant', 'Hotel', 'Cafe', 'Hospital', 'School', 'Store'];
const STATUSES   = ['ACTIVE', 'INACTIVE', 'PENDING'];

function toggleValue(current: string, value: string): string {
  const parts = current ? current.split(',').map((v) => v.trim()) : [];
  return parts.includes(value)
    ? parts.filter((v) => v !== value).join(',')
    : [...parts, value].join(',');
}

export default function Filters() {
  const dispatch = useAppDispatch();
  const state    = useAppSelector((s) => s.search);

  const set = (key: keyof SearchState, value: any) =>
    dispatch(setFilter({ key, value }));

  const activeCategories = state.category ? state.category.split(',').map((v) => v.trim()) : [];
  const activeStatuses   = state.status   ? state.status.split(',').map((v) => v.trim())   : [];

  return (
    <aside className="flex flex-col gap-5">

      <button
        onClick={() => dispatch(resetFilters())}
        className="text-xs font-mono text-muted hover:text-accent transition-colors text-left"
      >
        ← reset all
      </button>

      {/* Category */}
      <div>
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Category</p>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => set('category', toggleValue(state.category, cat))}
              className={`text-left text-sm px-3 py-1.5 rounded border transition-all ${
                activeCategories.includes(cat)
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border text-muted hover:border-dim hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Status</p>
        <div className="flex flex-col gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => set('status', toggleValue(state.status, s))}
              className={`text-left text-sm px-3 py-1.5 rounded border transition-all ${
                activeStatuses.includes(s)
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border text-muted hover:border-dim hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Location</p>
        <input
          type="text"
          value={state.location}
          onChange={(e) => set('location', e.target.value)}
          placeholder="e.g. Mumbai"
          className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-text placeholder:text-dim focus:border-accent transition-colors"
        />
      </div>

      {/* Date range */}
      <div>
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Date Range</p>
        <div className="flex flex-col gap-1">
          <input
            type="date"
            value={state.dateFrom}
            onChange={(e) => set('dateFrom', e.target.value)}
            className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-text focus:border-accent transition-colors"
          />
          <input
            type="date"
            value={state.dateTo}
            onChange={(e) => set('dateTo', e.target.value)}
            className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-text focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Per page */}
      <div>
        <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Per page</p>
        <select
          value={state.limit}
          onChange={(e) => set('limit', Number(e.target.value))}
          className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-text focus:border-accent transition-colors"
        >
          {[10, 20, 50, 100, 250].map((n) => (
            <option key={n} value={n}>{n} records</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
