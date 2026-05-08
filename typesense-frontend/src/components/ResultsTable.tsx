// src/components/ResultsTable.tsx

import { useAppSelector } from '../store/hooks';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:   'text-accent border-accent/30 bg-accent/5',
  INACTIVE: 'text-red-400 border-red-400/30 bg-red-400/5',
  PENDING:  'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
};

const CAT_COLOR: Record<string, string> = {
  Restaurant: 'text-orange-400',
  Hotel:      'text-blue-400',
  Cafe:       'text-pink-400',
  Hospital:   'text-red-400',
  School:     'text-purple-400',
  Store:      'text-cyan-400',
};

export default function ResultsTable() {
  const { data, loading, error } = useAppSelector((s) => s.search);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 font-mono text-sm">
        ✗ {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-surface rounded border border-border" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted font-mono text-sm">
        no results found
      </div>
    );
  }

  return (
    <div className="animate-slide-up overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            {['ID', 'Name', 'Category', 'Status', 'Location', 'Tags', 'Date'].map((h) => (
              <th key={h} className="text-left py-2 px-3 text-[10px] font-mono text-muted uppercase tracking-widest font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/50 hover:bg-surface/60 transition-colors group"
            >
              <td className="py-2.5 px-3 font-mono text-xs text-dim">{row.id}</td>
              <td className="py-2.5 px-3 text-text font-medium max-w-[180px] truncate" title={row.name}>
                {row.name}
              </td>
              <td className="py-2.5 px-3">
                <span className={`font-mono text-xs ${CAT_COLOR[row.category] ?? 'text-muted'}`}>
                  {row.category}
                </span>
              </td>
              <td className="py-2.5 px-3">
                <span className={`text-xs px-2 py-0.5 rounded border font-mono ${STATUS_COLOR[row.status] ?? 'text-muted border-dim'}`}>
                  {row.status}
                </span>
              </td>
              <td className="py-2.5 px-3 text-muted text-xs">{row.location}</td>
              <td className="py-2.5 px-3 max-w-[160px]">
                <div className="flex gap-1 flex-wrap">
                  {(Array.isArray(row.tags) ? row.tags : []).slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 bg-dim/30 text-muted rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-2.5 px-3 font-mono text-xs text-dim">
                {new Date(row.createdDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
