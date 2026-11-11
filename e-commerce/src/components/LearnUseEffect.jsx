import { useEffect, useState } from "react";

const LearnUseEffect = () => {
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState(""); // controlled input

  useEffect(() => {
    console.log("component re-rendered! Count:", count, " Email:", email);
  }, [count, email]);

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">useEffect playground</h1>
        <p className="mt-2 text-sm text-muted">
          Count: <span className="font-semibold text-accent">{count}</span>{" "}
          &middot; Email:{" "}
          <span className="font-semibold text-accent">
            {email || "—"}
          </span>
        </p>

        <label
          htmlFor="email"
          className="mt-6 block text-left text-sm font-medium text-ink"
        >
          Enter your email
        </label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
          placeholder="you@example.com"
        />

        <button
          type="button"
          className="btn btn-primary mt-5"
          onClick={() => setCount(count + 1)}
        >
          Count++
        </button>
      </div>
    </section>
  );
};

export default LearnUseEffect;
