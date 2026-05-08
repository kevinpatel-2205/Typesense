import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFilter } from '../store/searchSlice';

export default function Pagination() {
  const dispatch = useAppDispatch();
  const { meta } = useAppSelector((s) => s.search);

  if (!meta || meta.totalPages <= 1) return null;

  const total   = meta.totalPages;
  const current = meta.currentPage;

  const pages: (number | '...')[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  const go = (p: number) => dispatch(setFilter({ key: 'page', value: p }));

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      <button
        disabled={current <= 1}
        onClick={() => go(current - 1)}
        className="px-2 py-1 rounded border border-border text-muted hover:border-dim hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} className="px-2 text-dim">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p as number)}
            className={`px-2.5 py-1 rounded border transition-colors ${
              p === current
                ? 'border-accent text-accent bg-accent/5'
                : 'border-border text-muted hover:border-dim hover:text-text'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        disabled={current >= total}
        onClick={() => go(current + 1)}
        className="px-2 py-1 rounded border border-border text-muted hover:border-dim hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>

      <span className="ml-2 text-dim">
        {((current - 1) * meta.perPage + 1).toLocaleString()}
        {' – '}
        {Math.min(current * meta.perPage, meta.totalRecords).toLocaleString()}
        {' of '}
        {meta.totalRecords.toLocaleString()}
      </span>
    </div>
  );
}
