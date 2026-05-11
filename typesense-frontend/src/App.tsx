import { useEffect, useRef, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setFilter, fetchResults } from "./store/searchSlice";
import Filters from "./components/Filters";
import ResultsTable from "./components/ResultsTable";
import Pagination from "./components/Pagination";
import PerfBar from "./components/PerfBar";
import AddPlaceModal from "./components/AddPlaceModal";

export default function App() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.search);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const runSearch = useCallback(() => {
    dispatch(
      fetchResults({
        q: state.q,
        category: state.category,
        status: state.status,
        tags: state.tags,
        location: state.location,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        page: state.page,
        limit: state.limit,
      }),
    );
  }, [
    state.q,
    state.category,
    state.status,
    state.tags,
    state.location,
    state.dateFrom,
    state.dateTo,
    state.page,
    state.limit,
    dispatch,
  ]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const delay = state.q ? 300 : 0;
    debounce.current = setTimeout(runSearch, delay);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [runSearch]);

  // current search params to pass into the modal (for re-fetch after add)
  const searchParams = {
    q: state.q,
    category: state.category,
    status: state.status,
    tags: state.tags,
    location: state.location,
    dateFrom: state.dateFrom,
    dateTo: state.dateTo,
    page: state.page,
    limit: state.limit,
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-lg font-bold text-text tracking-tight">
            typesense<span className="text-accent">_poc</span>
          </h1>
          <p className="text-xs text-muted font-mono mt-0.5">
            faceted hybrid search · 10,00,000 records
          </p>
        </div>

        {/* search bar + add button */}
        <div className="flex items-center gap-3">
          <div className="relative w-96">
            <input
              type="text"
              value={state.q}
              onChange={(e) =>
                dispatch(setFilter({ key: "q", value: e.target.value }))
              }
              placeholder="search name, location, tags..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-dim focus:border-accent transition-colors pr-10"
            />
            {state.q && (
              <button
                onClick={() => dispatch(setFilter({ key: "q", value: "" }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-text transition-colors text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* ✅ NEW: add place button */}
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-mono px-4 py-2.5 rounded-lg border border-accent text-accent bg-accent/5 hover:bg-accent/10 transition-all whitespace-nowrap"
          >
            + add place
          </button>
        </div>
      </header>

      <div className="flex">
        <div className="w-64 shrink-0 border-r border-border px-5 py-6 min-h-[calc(100vh-65px)]">
          <Filters />
        </div>
        <main className="flex-1 px-6 py-5 flex flex-col gap-4 min-w-0">
          <PerfBar />

          {(state.category ||
            state.status ||
            state.tags ||
            state.location ||
            state.dateFrom) && (
            <div className="flex gap-2 flex-wrap">
              {state.category &&
                state.category.split(",").map((c) => (
                  <span
                    key={c}
                    className="text-xs font-mono px-2 py-1 bg-accent/10 text-accent rounded border border-accent/20"
                  >
                    {c.trim()}
                  </span>
                ))}
              {state.status &&
                state.status.split(",").map((s) => (
                  <span
                    key={s}
                    className="text-xs font-mono px-2 py-1 bg-surface text-muted rounded border border-border"
                  >
                    {s.trim()}
                  </span>
                ))}
              {state.location && (
                <span className="text-xs font-mono px-2 py-1 bg-surface text-muted rounded border border-border">
                  📍 {state.location}
                </span>
              )}
              {state.dateFrom && (
                <span className="text-xs font-mono px-2 py-1 bg-surface text-muted rounded border border-border">
                  {state.dateFrom} → {state.dateTo || "now"}
                </span>
              )}
            </div>
          )}

          <ResultsTable />
          <Pagination />
        </main>
      </div>

      {/* ✅ NEW: modal */}
      <AddPlaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        searchParams={searchParams}
      />
    </div>
  );
}
