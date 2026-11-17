import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowUpDown,
  BadgeCheck,
  ChevronDown,
  MessageSquare,
  RefreshCw,
  Send,
  Star,
} from "lucide-react";
import CustomersSay from "./CustomersSay";

/* ---------- helpers ---------- */

/* Fallback for rows saved before the AI sentiment column existed. */
const ratingSentiment = (rating) =>
  rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";

/*
 * The backend stores POSITIVE / NEUTRAL / NEGATIVE / PENDING on every review.
 * Legacy rows have no stored value yet, so fall back to the old rating rule.
 */
const normalizeSentiment = (value, rating) => {
  const key = String(value || "").toLowerCase();
  if (key === "positive" || key === "neutral" || key === "negative" || key === "pending") {
    return key;
  }
  return ratingSentiment(rating);
};

const SENTIMENTS = {
  positive: {
    label: "Positive",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  neutral: {
    label: "Neutral",
    chip: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    dot: "bg-amber-500",
  },
  negative: {
    label: "Negative",
    chip: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
    dot: "bg-rose-500",
  },
  pending: {
    label: "Pending",
    chip: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/20",
    dot: "bg-slate-400",
  },
};

const FILTERS = [
  { id: "all", label: "All reviews" },
  { id: "positive", label: "Positive" },
  { id: "neutral", label: "Neutral" },
  { id: "negative", label: "Negative" },
  { id: "pending", label: "Pending" },
];

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

const AVATARS = [
  "from-brand-500 to-fuchsia-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-indigo-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
];

const avatarClass = (name = "") => {
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATARS[index % AVATARS.length];
};

const timeAgo = (timestamp) => {
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const REVIEWS_API_URL = `${API_BASE_URL}/api/v1/reviews`;

/* Maps the Spring Boot Review entity onto the shape this component renders. */
const newLocalId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toUiReview = (saved) => ({
  id: String(saved.reviewId ?? saved.id ?? newLocalId()),
  name: saved.userName ?? saved.name ?? "Anonymous",
  rating: Number(saved.star ?? saved.rating ?? 0),
  text: saved.review ?? saved.text ?? "",
  createdAt: saved.reviewTimestamp
    ? new Date(saved.reviewTimestamp).getTime()
    : Date.now(),
  verified: false,
  sentiment: saved.sentiment ?? null,
  sentimentConfidence: saved.sentimentConfidence ?? null,
  sentimentSource: saved.sentimentSource ?? null,
});

const readErrorMessage = async (response) => {
  try {
    const body = await response.json();
    if (body?.error) return body.error;
  } catch {
    // response was not JSON
  }
  return `Request failed (${response.status})`;
};

/* ---------- small UI pieces ---------- */

const Stars = ({ rate = 0, size = 15 }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rate} out of 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={size}
        strokeWidth={1.5}
        className={
          i < Math.round(rate)
            ? "fill-star text-star"
            : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
        }
      />
    ))}
  </div>
);

const RatingPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
        role="radiogroup"
        aria-label="Your rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Star
              size={24}
              strokeWidth={1.5}
              className={
                star <= shown
                  ? "fill-star text-star"
                  : "fill-transparent text-slate-300 dark:text-slate-600"
              }
            />
          </button>
        ))}
      </div>
      <span className="text-xs font-medium text-muted">
        {RATING_LABELS[shown] || "Select rating"}
      </span>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const sentimentKey = normalizeSentiment(review.sentiment, review.rating);
  const sentiment = SENTIMENTS[sentimentKey];
  const sentimentTitle =
    review.sentimentConfidence != null
      ? `AI sentiment (${Math.round(review.sentimentConfidence * 100)}% confidence)`
      : "Sentiment pending AI classification";

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-brand-200 dark:hover:border-brand-500/40 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarClass(
            review.name
          )} text-sm font-bold text-white shadow-sm`}
        >
          {review.name.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h4 className="text-sm font-semibold text-ink">{review.name}</h4>
            {review.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                <BadgeCheck size={11} strokeWidth={2.2} />
                Verified
              </span>
            )}
            <span
              className="text-xs text-muted"
              title={new Date(review.createdAt).toLocaleString()}
            >
              · {timeAgo(review.createdAt)}
            </span>
            <span
              title={sentimentTitle}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${sentiment.chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${sentiment.dot}`} />
              {sentiment.label}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <Stars rate={review.rating} size={14} />
            <span className="text-xs font-medium text-muted">
              {review.rating}/5
            </span>
          </div>

          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-body">
            {review.text}
          </p>
        </div>
      </div>
    </article>
  );
};

/* ---------- main component ---------- */

const Reviews = ({ product }) => {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [formError, setFormError] = useState("");

  /* Load this product's reviews from Postgres through the Spring Boot API. */
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setStatus("loading");
    setLoadError("");

    (async () => {
      try {
        const response = await fetch(
          `${REVIEWS_API_URL}?productId=${encodeURIComponent(product.id)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const rows = await response.json();
        if (!active) return;

        setReviews(Array.isArray(rows) ? rows.map(toUiReview) : []);
        setStatus("ready");
      } catch (error) {
        if (!active || error.name === "AbortError") return;
        setLoadError(error.message);
        setStatus("error");
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [product.id, attempt]);

  const counts = useMemo(() => {
    const base = { all: reviews.length, positive: 0, neutral: 0, negative: 0, pending: 0 };
    reviews.forEach((review) => {
      base[normalizeSentiment(review.sentiment, review.rating)] += 1;
    });
    return base;
  }, [reviews]);

  /* Only surface the Pending chip when the AI actually left something unlabelled. */
  const filters = useMemo(
    () => (counts.pending > 0 ? FILTERS : FILTERS.filter((option) => option.id !== "pending")),
    [counts.pending]
  );

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    );
  }, [reviews]);

  const distribution = useMemo(() => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (buckets[review.rating] != null) buckets[review.rating] += 1;
    });
    return buckets;
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const filtered =
      filter === "all"
        ? reviews
        : reviews.filter(
            (review) => normalizeSentiment(review.sentiment, review.rating) === filter
          );

    return [...filtered].sort((a, b) =>
      sort === "latest"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt
    );
  }, [reviews, filter, sort]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanText = text.trim();

    if (!cleanName) {
      setFormError("Please enter your name before posting.");
      return;
    }
    if (cleanText.length < 10) {
      setFormError("Please write at least 10 characters in your review.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const response = await fetch(REVIEWS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(product.id),
          userName: cleanName,
          star: rating,
          review: cleanText,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const saved = await response.json();
      const savedReview = toUiReview(saved);

      setReviews((current) => [
        savedReview,
        ...current.filter((review) => review.id !== savedReview.id),
      ]);
      setStatus("ready");
      setText("");
      setRating(5);
      setFormError("");
      setFilter("all");
      setSort("latest");
      toast.success("Thanks! Your review has been posted.");
    } catch (error) {
      setFormError(
        error.message || "Your review could not be saved. Please try again."
      );
      toast.error("Your review could not be saved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="mt-10 scroll-mt-24">
      <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_-25px_rgba(49,46,129,0.35)] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-black/40 sm:p-8">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">
              Customer Reviews
            </h2>
            <p className="mt-1 text-sm text-muted">
              Real feedback from people who bought this item.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-accent ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">
            <Star size={13} className="fill-star text-star" />
            {average.toFixed(1)} average
            <span className="font-normal text-muted">
              · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* summary + distribution */}
          <div className="rounded-2xl border border-line bg-slate-50/70 p-5 dark:bg-slate-800/50">
            <div className="flex items-end gap-3">
              <p className="font-display text-5xl font-bold leading-none text-ink">
                {average.toFixed(1)}
              </p>
              <div className="pb-1">
                <Stars rate={average} size={16} />
                <p className="mt-1 text-xs text-muted">
                  {reviews.length} written{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {[5, 4, 3, 2, 1].map((value) => {
                const percent =
                  reviews.length === 0
                    ? 0
                    : (distribution[value] / reviews.length) * 100;

                return (
                  <div key={value} className="flex items-center gap-2">
                    <span className="w-3 text-xs font-medium text-muted">
                      {value}
                    </span>
                    <Star
                      size={11}
                      className="shrink-0 fill-star text-star"
                      strokeWidth={1.5}
                    />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-star transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-muted">
                      {distribution[value]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI summary above the review list */}
          <CustomersSay product={product} reviews={reviews} />
        </div>

        {/* toolbar: filters + sort */}
        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reviews">
            {filters.map((option) => {
              const active = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(option.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/25"
                      : "border-line bg-surface text-body hover:border-brand-200 hover:bg-brand-50 hover:text-accent"
                  }`}
                >
                  {option.id !== "all" && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active
                          ? "bg-white"
                          : SENTIMENTS[option.id].dot
                      }`}
                    />
                  )}
                  {option.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-muted dark:bg-slate-700"
                    }`}
                  >
                    {counts[option.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative self-start lg:self-auto">
            <ArrowUpDown
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              aria-label="Sort reviews"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="w-full appearance-none rounded-xl border border-line bg-surface py-2 pl-9 pr-9 text-sm font-medium text-body outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </div>

        {/* review list */}
        <div className="mt-5 space-y-4">
          {status === "loading" ? (
            <div aria-hidden="true" className="space-y-4">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="animate-pulse rounded-2xl border border-line bg-surface p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-3 w-40 rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="mt-2 h-2.5 w-9/12 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : status === "error" ? (
            <div className="rounded-2xl border border-dashed border-line bg-slate-50/60 p-10 text-center dark:bg-slate-800/40">
              <MessageSquare
                size={28}
                strokeWidth={1.5}
                className="mx-auto text-muted"
              />
              <p className="mt-3 text-sm font-semibold text-ink">
                We couldn&apos;t load the reviews
              </p>
              <p className="mt-1 text-xs text-muted">
                {loadError || "Please check that the backend is running."}
              </p>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="btn btn-ghost mt-4"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          ) : visibleReviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-slate-50/60 p-10 text-center dark:bg-slate-800/40">
              <MessageSquare
                size={28}
                strokeWidth={1.5}
                className="mx-auto text-muted"
              />
              <p className="mt-3 text-sm font-semibold text-ink">
                No {filter === "all" ? "" : `${filter} `}reviews yet
              </p>
              <p className="mt-1 text-xs text-muted">
                Try a different filter or be the first to share your thoughts.
              </p>
              {filter !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="btn btn-ghost mt-4"
                >
                  Show all reviews
                </button>
              )}
            </div>
          ) : (
            visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </div>

        {/* write a review — below the review list */}
        <div className="mt-8 border-t border-line pt-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <h3 className="text-base font-semibold text-ink">
              Write a review
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Your feedback helps other shoppers decide.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="review-name"
                  className="mb-1.5 block text-xs font-semibold text-body"
                >
                  Your name
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (formError) setFormError("");
                  }}
                  maxLength={40}
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-body">
                  Your rating
                </span>
                <RatingPicker value={rating} onChange={setRating} />
              </div>
            </div>

            <div className="mt-3">
              <label
                htmlFor="review-text"
                className="mb-1.5 block text-xs font-semibold text-body"
              >
                Your review
              </label>
              <textarea
                id="review-text"
                rows={4}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  if (formError) setFormError("");
                }}
                maxLength={500}
                placeholder="What did you like or dislike about this product?"
                className="w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {formError && (
              <p role="alert" className="mt-2 text-xs font-medium text-danger">
                {formError}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted">{text.length}/500</span>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={15} strokeWidth={1.9} />
                {submitting ? "Posting…" : "Post review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
