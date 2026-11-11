import { Link } from "react-router";
import { Home, SearchX } from "lucide-react";

const NotFound = () => {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-accent">
        <SearchX size={30} strokeWidth={1.6} />
      </span>
      <p className="mt-6 font-display text-6xl font-extrabold tracking-tight text-ink">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary mt-8">
        <Home size={16} />
        Back to home
      </Link>
    </section>
  );
};

export default NotFound;
