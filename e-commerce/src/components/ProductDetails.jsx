import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/Cart";
import {
  Heart,
  Lock,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Truck,
} from "lucide-react";

const Stars = ({ rate = 0 }) => {
  const rounded = Math.round(rate);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rate} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          strokeWidth={1.5}
          className={
            i < rounded
              ? "fill-star text-star"
              : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
          }
        />
      ))}
    </div>
  );
};

const Feature = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3 transition-colors duration-300 hover:border-brand-200 hover:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-accent shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:text-brand-400 dark:ring-slate-700">
      <Icon size={18} strokeWidth={1.8} />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </p>
      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </div>
  </div>
);

const Skeleton = () => (
  <div className="grid animate-pulse gap-10 lg:grid-cols-2">
    <div className="aspect-square rounded-3xl bg-slate-200/80 dark:bg-slate-700/60" />
    <div className="space-y-4 py-4">
      <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="h-9 w-4/5 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-14 w-48 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="h-24 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex gap-3">
        <div className="h-12 w-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-12 flex-1 rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  </div>
);

const ProductDetails = () => {
  const { prodId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [tab, setTab] = useState("description");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        // const res = await axios.get("https://fakestoreapi.com/products");
        // const data = await res.data;
        const res = await fetch(`https://fakestoreapi.com/products/${prodId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (!data || !data.id) throw new Error("Product not found");
        setProduct(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log("Something Went Wrong :" + err.message);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchProduct();
    return () => controller.abort();
  }, [prodId]);

  const price = Number(product?.price) || 0;
  const mrp = price / 0.75;
  const rate = product?.rating?.rate ?? 0;
  const count = product?.rating?.count ?? 0;

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(addToCart(product, quantity));
    toast.success(
      `${quantity} × ${product?.title?.slice(0, 34)}${
        product?.title?.length > 34 ? "…" : ""
      } added to cart`
    );
  };

  const handleBuyNow = () => {
    if (!product) return;

    dispatch(addToCart(product, quantity));
    navigate("/cart");
  };

  const tabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Details" },
    { id: "shipping", label: "Shipping" },
  ];

  return (
    <section className="relative isolate mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-brand-100/70 via-white/0 to-transparent dark:from-brand-500/10"
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
      >
        <Link
          to="/"
          className="transition-colors hover:text-accent dark:hover:text-brand-400"
        >
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to="/"
          className="capitalize transition-colors hover:text-accent dark:hover:text-brand-400"
        >
          {product?.category || "Products"}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="max-w-[16rem] truncate font-medium text-slate-900 dark:text-slate-100">
          {product?.title || `Product #${prodId}`}
        </span>
      </nav>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm dark:border-red-500/20 dark:bg-slate-900">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            We couldn&apos;t load this product
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {error}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500"
          >
            Back to home
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_20px_60px_-25px_rgba(49,46,129,0.35)] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-black/40">
          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-2 lg:gap-14 lg:p-10">
            {/* ---------- image panel ---------- */}
            <div className="relative">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-white to-brand-50 ring-1 ring-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-brand-950/40 dark:ring-slate-700">
                <div
                  aria-hidden="true"
                  className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brand-300/30 blur-3xl transition-opacity duration-500 group-hover:opacity-80 dark:bg-brand-500/20"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-fuchsia-300/25 blur-3xl transition-opacity duration-500 group-hover:opacity-80 dark:bg-fuchsia-500/15"
                />

                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-brand-300">
                  <Tag size={12} strokeWidth={2.2} />
                  {product.category}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setWishlisted((v) => !v);
                    toast.info(
                      wishlisted ? "Removed from wishlist" : "Saved to wishlist"
                    );
                  }}
                  aria-label={
                    wishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                  aria-pressed={wishlisted}
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur transition hover:scale-105 hover:text-rose-500 active:scale-95 dark:bg-slate-900/80 dark:text-slate-300"
                >
                  <Heart
                    size={19}
                    strokeWidth={1.7}
                    className={
                      wishlisted ? "fill-rose-500 text-rose-500" : "fill-none"
                    }
                  />
                </button>

                <div className="relative flex aspect-square items-center justify-center p-10 sm:p-14">
                  <img
                    src={
                      product.image ||
                      "https://v3.flowbite.com/images/products/apple-watch.png"
                    }
                    alt={product.title}
                    className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                <span className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  In stock
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Free delivery by{" "}
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    tomorrow
                  </span>
                </span>
              </div>
            </div>

            {/* ---------- info panel ---------- */}
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold capitalize text-accent ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">
                  <Tag size={13} strokeWidth={2} />
                  {product.category}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  SKU&nbsp;#{String(product.id).padStart(5, "0")}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {product.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Stars rate={rate} />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {rate}
                </span>
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  ({count.toLocaleString()} reviews)
                </span>
                <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setTab("details")}
                  className="text-sm font-medium text-accent underline-offset-4 hover:underline dark:text-brand-400"
                >
                  See all reviews
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  ${price.toFixed(2)}
                </span>
                <span className="pb-1 text-lg text-slate-400 line-through dark:text-slate-500">
                  ${mrp.toFixed(2)}
                </span>
                <span className="mb-1.5 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  Save 25%
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Inclusive of all taxes &middot; Free shipping on this item
              </p>

              {/* tabs */}
              <div className="mt-7">
                <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        tab === t.id
                          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 min-h-[7.5rem] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {tab === "description" && (
                    <p className="animate-[fadeIn_0.25s_ease-out]">
                      {product.description}
                    </p>
                  )}

                  {tab === "details" && (
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                      {[
                        ["Product ID", `#${product.id}`],
                        ["Category", product.category],
                        ["Rating", `${rate} / 5`],
                        ["Reviews", count.toLocaleString()],
                        ["Availability", "In stock"],
                        ["Sold by", "FakeStore Official"],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
                        >
                          <dt className="text-slate-500 dark:text-slate-400">
                            {label}
                          </dt>
                          <dd className="font-medium capitalize text-slate-900 dark:text-white">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {tab === "shipping" && (
                    <ul className="space-y-2">
                      <li>✓ Dispatched within 24 hours of order confirmation.</li>
                      <li>✓ Free standard delivery in 2–4 business days.</li>
                      <li>✓ Easy 30-day returns and exchange available.</li>
                      <li>✓ Secure payments with encrypted checkout.</li>
                    </ul>
                  )}
                </div>
              </div>

              {/* quantity + actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-12 items-center justify-between rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-900 sm:w-36">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    −
                  </button>
                  <span
                    aria-live="polite"
                    className="min-w-6 text-center text-sm font-bold text-slate-900 dark:text-white"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="group inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-600/30 active:translate-y-0"
                >
                  <ShoppingCart
                    size={18}
                    strokeWidth={1.9}
                    className="transition-transform group-hover:scale-110"
                  />
                  Add to cart
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-brand-300 hover:bg-brand-50 hover:text-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
                >
                  Buy now
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Order in the next 4 hours for delivery by{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  tomorrow evening
                </span>
                .
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Feature
                  icon={Truck}
                  title="Free delivery"
                  subtitle="On all orders over $50"
                />
                <Feature
                  icon={RotateCcw}
                  title="30-day returns"
                  subtitle="No questions asked"
                />
                <Feature
                  icon={ShieldCheck}
                  title="2-year warranty"
                  subtitle="Genuine product guarantee"
                />
                <Feature
                  icon={Lock}
                  title="Secure payment"
                  subtitle="256-bit SSL encrypted"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetails;
