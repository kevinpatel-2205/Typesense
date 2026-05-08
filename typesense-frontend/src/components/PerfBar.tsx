// src/components/PerfBar.tsx

import { useAppSelector } from '../store/hooks';

export default function PerfBar() {
  const { meta, loading } = useAppSelector((s) => s.search);

  if (!meta && !loading) return null;

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-surface border border-border rounded-lg font-mono text-xs animate-fade-in">
      {loading ? (
        <span className="text-muted animate-pulse">searching...</span>
      ) : meta ? (
        <>
          {/* Speed indicators */}
          <span className="flex items-center gap-1">
            <span className="text-muted">API</span>
            <span className={`font-bold ${meta.queryTimeMs <= 5 ? 'text-accent' : meta.queryTimeMs <= 20 ? 'text-yellow-400' : 'text-red-400'}`}>
              {meta.queryTimeMs}ms
            </span>
          </span>

          <span className="text-dim">|</span>

          <span className="flex items-center gap-1">
            <span className="text-muted">Typesense</span>
            <span className={`font-bold ${meta.typesenseTimeMs <= 3 ? 'text-accent' : 'text-yellow-400'}`}>
              {meta.typesenseTimeMs}ms
            </span>
          </span>

          <span className="text-dim">|</span>

          {/* Record counts */}
          <span className="flex items-center gap-1">
            <span className="text-muted">total</span>
            <span className="text-text font-bold">{meta.totalRecords.toLocaleString()}</span>
          </span>

          <span className="text-dim">|</span>

          <span className="flex items-center gap-1">
            <span className="text-muted">page</span>
            <span className="text-text font-bold">{meta.currentPage}</span>
            <span className="text-muted">of</span>
            <span className="text-text font-bold">{meta.totalPages.toLocaleString()}</span>
          </span>

          <span className="text-dim">|</span>

          <span className="flex items-center gap-1">
            <span className="text-muted">showing</span>
            <span className="text-text font-bold">{meta.returnedCount}</span>
          </span>
        </>
      ) : null}
    </div>
  );
}
