import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addPlace, resetAddPlace, fetchResults } from "../store/searchSlice";

const CATEGORIES = [
  "Restaurant",
  "Hotel",
  "Cafe",
  "Hospital",
  "School",
  "Store",
];
const STATUSES = ["ACTIVE", "INACTIVE", "PENDING"];

interface Props {
  open: boolean;
  onClose: () => void;
  // pass current search state so we can re-run the search after adding
  searchParams: Record<string, any>;
}

const EMPTY = {
  name: "",
  description: "",
  category: "",
  status: "",
  location: "",
  tags: "",
};

export default function AddPlaceModal({ open, onClose, searchParams }: Props) {
  const dispatch = useAppDispatch();
  const { addLoading, addError, addSuccess } = useAppSelector((s) => s.search);

  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  // focus first field when modal opens
  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setTouched({});
      dispatch(resetAddPlace());
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, dispatch]);

  // after success: re-fetch results, then close after a short delay
  useEffect(() => {
    if (addSuccess) {
      dispatch(fetchResults(searchParams));
      const t = setTimeout(() => {
        onClose();
        dispatch(resetAddPlace());
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [addSuccess, dispatch, onClose, searchParams]);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const touch = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  // simple client-side validation
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.category) errors.category = "Pick a category";
  if (!form.status) errors.status = "Pick a status";
  if (!form.location.trim()) errors.location = "Location is required";
  if (!form.tags.trim()) errors.tags = "At least one tag is required";

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = () => {
    // touch all fields to show errors
    setTouched({
      name: true,
      category: true,
      status: true,
      location: true,
      tags: true,
    });
    if (!isValid) return;
    dispatch(
      addPlace({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        status: form.status,
        location: form.location.trim(),
        tags: form.tags.trim(),
      }),
    );
  };

  if (!open) return null;

  const fieldErr = (key: string) =>
    touched[key] && errors[key] ? (
      <p className="text-[10px] font-mono text-red-400 mt-1">{errors[key]}</p>
    ) : null;

  return (
    // backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* panel */}
      <div className="bg-bg border border-border rounded-xl w-full max-w-lg mx-4 shadow-2xl animate-slide-up">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-mono text-sm font-bold text-text tracking-tight">
              add<span className="text-accent">_place</span>
            </h2>
            <p className="text-[10px] font-mono text-muted mt-0.5">
              saves to MySQL → syncs to Typesense instantly
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-dim hover:text-text transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-[10px] font-mono text-muted uppercase tracking-widest">
              Name *
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => touch("name")}
              placeholder="e.g. The Grand Cafe"
              className={`mt-1 w-full bg-surface border rounded px-3 py-2 text-sm text-text placeholder:text-dim focus:border-accent transition-colors ${
                touched.name && errors.name ? "border-red-400" : "border-border"
              }`}
            />
            {fieldErr("name")}
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-mono text-muted uppercase tracking-widest">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="mt-1 w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text placeholder:text-dim focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Category + Status side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-muted uppercase tracking-widest">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  set("category", e.target.value);
                  touch("category");
                }}
                className={`mt-1 w-full bg-surface border rounded px-3 py-2 text-sm text-text focus:border-accent transition-colors ${
                  touched.category && errors.category
                    ? "border-red-400"
                    : "border-border"
                }`}
              >
                <option value="">Select...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {fieldErr("category")}
            </div>
            <div>
              <label className="text-[10px] font-mono text-muted uppercase tracking-widest">
                Status *
              </label>
              <select
                value={form.status}
                onChange={(e) => {
                  set("status", e.target.value);
                  touch("status");
                }}
                className={`mt-1 w-full bg-surface border rounded px-3 py-2 text-sm text-text focus:border-accent transition-colors ${
                  touched.status && errors.status
                    ? "border-red-400"
                    : "border-border"
                }`}
              >
                <option value="">Select...</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {fieldErr("status")}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] font-mono text-muted uppercase tracking-widest">
              Location *
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              onBlur={() => touch("location")}
              placeholder="e.g. Mumbai"
              className={`mt-1 w-full bg-surface border rounded px-3 py-2 text-sm text-text placeholder:text-dim focus:border-accent transition-colors ${
                touched.location && errors.location
                  ? "border-red-400"
                  : "border-border"
              }`}
            />
            {fieldErr("location")}
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-mono text-muted uppercase tracking-widest">
              Tags *
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              onBlur={() => touch("tags")}
              placeholder="comma-separated e.g. coffee,wifi,cozy"
              className={`mt-1 w-full bg-surface border rounded px-3 py-2 text-sm text-text placeholder:text-dim focus:border-accent transition-colors ${
                touched.tags && errors.tags ? "border-red-400" : "border-border"
              }`}
            />
            {fieldErr("tags")}
            {/* live tag preview */}
            {form.tags.trim() && (
              <div className="flex gap-1 flex-wrap mt-2">
                {form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.5 bg-accent/10 text-accent rounded border border-accent/20"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* API error */}
          {addError && (
            <div className="text-xs font-mono text-red-400 bg-red-400/5 border border-red-400/20 rounded px-3 py-2">
              ✗ {addError}
            </div>
          )}

          {/* Success */}
          {addSuccess && (
            <div className="text-xs font-mono text-accent bg-accent/5 border border-accent/20 rounded px-3 py-2">
              ✓ Place added and synced to Typesense!
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="text-xs font-mono text-muted hover:text-text transition-colors px-3 py-1.5"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={addLoading || addSuccess}
            className="text-xs font-mono px-4 py-1.5 rounded border border-accent text-accent bg-accent/5 hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {addLoading ? "saving..." : addSuccess ? "✓ saved!" : "add place →"}
          </button>
        </div>
      </div>
    </div>
  );
}
