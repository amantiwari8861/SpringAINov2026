import { useEffect, useState } from "react";
import {ChevronDown,RefreshCw,Sparkles,ThumbsDown,ThumbsUp} from "lucide-react";

const API_BASE_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const INSIGHTS_API_URL = `${API_BASE_URL}/api/v1/reviews/insights`;

/* ---------- small pieces ---------- */

const Skeleton = () => (
  <div aria-hidden="true" className="animate-pulse">
    <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="mt-2 h-3 w-11/12 rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="mt-2 h-3 w-8/12 rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="mt-5 flex flex-wrap gap-2">
      {[72, 108, 88, 60].map((width) => (
        <div
          key={width}
          className="h-7 rounded-full bg-slate-200 dark:bg-slate-700"
          style={{ width }}
        />
      ))}
    </div>
  </div>
);

const PointList = ({ label, items, tone }) => {
  const positive = tone === "positive";
  const Icon = positive ? ThumbsUp : ThumbsDown;

  return (
    <div>
      <p
        className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${
          positive
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-rose-700 dark:text-rose-400"
        }`}
      >
        <Icon size={12} strokeWidth={2.1} />
        {label}
      </p>

      {items?.length ? (
        <ul className="mt-2 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${label}-${index}`}
              className="text-xs leading-relaxed text-body"
            >
              &ldquo;{item}&rdquo;
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted">
          No specific comments in this area.
        </p>
      )}
    </div>
  );
};

/* ---------- main component ---------- */

const CustomersSay = ({ product, reviews }) => {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [expandedAspect, setExpandedAspect] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const productId = product?.id;
  const productName = product?.title || product?.name || "this product";

  useEffect(() => {
    if (!reviews || reviews.length === 0) {
      setStatus("empty");
      setData(null);
      setError("");
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100000);
    let active = true;

    setStatus("loading");
    setData(null);
    setError("");
    setExpandedAspect(null);

    const payload = {
      productId,
      productName,
      reviews: reviews.map((review) => ({
        name: review.name,
        rating: review.rating,
        text: review.text,
      })),
    };

    (async () => {
      try {
        const response = await fetch(INSIGHTS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const result = await response.json();
        if (!active) return;

        clearTimeout(timeoutId);
        setData(result);
        setStatus("ready");
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError.name === "AbortError"
            ? "The summary took too long to generate."
            : requestError.message,
        );
        setStatus("error");
      }
    })();

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [productId, productName, reviews, attempt]);

  const aspects = Array.isArray(data?.aspects) ? data.aspects : [];
  const activeAspect = aspects.find((aspect) => aspect.name === expandedAspect);

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-accent ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">
          <Sparkles size={16} strokeWidth={1.9} />
        </span>
        <h3 className="text-lg font-semibold text-ink">Customers say</h3>
      </div>

      {status === "loading" && (
        <div className="mt-4">
          <Skeleton />
        </div>
      )}

      {status === "empty" && (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Once customers start writing reviews, an AI summary of their feedback
          will appear here.
        </p>
      )}

      {status === "error" && (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-muted">
            We couldn&apos;t generate the review summary right now. Your reviews
            are still available below.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="btn btn-ghost mt-3"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          {error && <p className="mt-2 text-[11px] text-muted">{error}</p>}
        </div>
      )}

      {status === "ready" && (
        <>
          <p className="mt-3 text-sm leading-relaxed text-body">
            {data.summary}
          </p>

          {aspects.length > 0 && (
            <>
              <div
                className="mt-4 flex flex-wrap gap-2"
                role="group"
                aria-label="Review aspects"
              >
                {aspects.map((aspect) => {
                  const isOpen = expandedAspect === aspect.name;
                  return (
                    <button
                      key={aspect.name}
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setExpandedAspect(isOpen ? null : aspect.name)
                      }
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        isOpen
                          ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/25"
                          : "border-line bg-slate-50 text-body hover:border-brand-200 hover:bg-brand-50 hover:text-accent dark:bg-slate-800/60"
                      }`}
                    >
                      {aspect.name}({aspect.count})
                      <ChevronDown
                        size={13}
                        strokeWidth={2.2}
                        className={`transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {activeAspect && (
                <div className="mt-4 rounded-xl border border-line bg-slate-50/70 p-4 dark:bg-slate-800/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-ink">
                      {activeAspect.name}
                    </h4>
                    <span className="text-[11px] font-medium text-muted">
                      {activeAspect.count}{" "}
                      {activeAspect.count === 1
                        ? "review mentions"
                        : "reviews mention"}{" "}
                      this
                    </span>
                  </div>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <PointList
                      label="Positive"
                      items={activeAspect.positives}
                      tone="positive"
                    />
                    <PointList
                      label="Negative"
                      items={activeAspect.negatives}
                      tone="negative"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-auto pt-4">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <Sparkles size={12} strokeWidth={1.9} />
              {data.aiGenerated
                ? "AI Generated from the text of customer reviews"
                : "Generated from the text of customer reviews"}
            </p>
            <p className="mt-1 text-[11px] text-muted">Select to learn more</p>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomersSay;
