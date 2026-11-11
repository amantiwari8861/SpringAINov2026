import { useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
} from "../redux/slices/Cart";

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 4.99;

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

const CartItemRow = ({ item }) => {
  const dispatch = useDispatch();
  const lineTotal = Number(item.price || 0) * item.quantity;
  const shortTitle = item.title?.slice(0, 40) || "Item";

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
    toast.info(`${shortTitle}${item.title?.length > 40 ? "…" : ""} removed`);
  };

  return (
    <li className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:p-5">
      <Link
        to={`/product/${item.id}`}
        className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-canvas p-2 sm:h-24 sm:w-24"
      >
        <img
          src={item.image}
          alt={item.title || "Product image"}
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </Link>

      <div className="min-w-0 flex-1">
        {item.category && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {item.category}
          </p>
        )}
        <Link
          to={`/product/${item.id}`}
          className="mt-0.5 block text-sm font-semibold leading-snug text-ink transition-colors hover:text-accent"
          title={item.title}
        >
          <span className="line-clamp-2">{item.title || "Untitled product"}</span>
        </Link>
        <p className="mt-1 text-xs text-muted">
          {formatPrice(item.price)} each
        </p>
      </div>

      <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
        <div className="flex h-9 items-center rounded-lg border border-line bg-surface">
          <button
            type="button"
            onClick={() => dispatch(decreaseQuantity(item.id))}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.title || "item"}`}
            className="grid h-9 w-9 place-items-center rounded-l-lg text-body transition-colors hover:bg-brand-50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={14} strokeWidth={2.2} />
          </button>
          <span
            aria-live="polite"
            className="min-w-8 text-center text-sm font-semibold text-ink"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => dispatch(increaseQuantity(item.id))}
            disabled={item.quantity >= 99}
            aria-label={`Increase quantity of ${item.title || "item"}`}
            className="grid h-9 w-9 place-items-center rounded-r-lg text-body transition-colors hover:bg-brand-50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} strokeWidth={2.2} />
          </button>
        </div>

        <span className="w-20 text-right text-sm font-bold text-ink sm:w-24">
          {formatPrice(lineTotal)}
        </span>

        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${item.title || "item"} from cart`}
          title="Remove from cart"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-danger"
        >
          <Trash2 size={16} strokeWidth={1.9} />
        </button>
      </div>
    </li>
  );
};

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const [lastOrder, setLastOrder] = useState(null);

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Number((subtotal + shipping).toFixed(2));
  const remainingForFree =
    subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD
      ? FREE_SHIPPING_THRESHOLD - subtotal
      : 0;

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.info("Cart cleared");
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    setLastOrder({
      id: `EC-${Date.now().toString().slice(-6)}`,
      total,
      count,
    });
    dispatch(clearCart());
    toast.success("Order placed successfully!");
  };

  // ---------- order placed ----------
  if (cartItems.length === 0 && lastOrder) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-success/10 text-success">
          <CheckCircle2 size={32} strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Order placed!</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          Thanks for shopping with us. Your order{" "}
          <span className="font-semibold text-ink">#{lastOrder.id}</span> is
          confirmed and on its way soon.
        </p>

        <div className="mt-6 flex w-full max-w-xs items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm">
          <span className="text-muted">
            {lastOrder.count} item{lastOrder.count === 1 ? "" : "s"}
          </span>
          <span className="font-bold text-ink">{formatPrice(lastOrder.total)}</span>
        </div>

        <Link to="/" className="btn btn-primary mt-8">
          <ShoppingBag size={16} />
          Continue shopping
        </Link>
      </section>
    );
  }

  // ---------- empty cart ----------
  if (cartItems.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-accent">
          <ShoppingBag size={30} strokeWidth={1.7} />
        </span>
        <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
          Looks like you haven&apos;t added anything yet. Explore the collection
          and find something you love.
        </p>
        <Link to="/" className="btn btn-primary mt-8">
          <ArrowLeft size={16} />
          Continue shopping
        </Link>
      </section>
    );
  }

  // ---------- cart with items ----------
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-muted"
          >
            <Link to="/" className="transition-colors hover:text-accent">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-body">Cart</span>
          </nav>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Your cart</h1>
        </div>
        <p className="text-sm text-muted">
          {count} item{count === 1 ? "" : "s"} in your cart
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ---------- items ---------- */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
            <h2 className="text-sm font-semibold text-ink">Items</h2>
            <button
              type="button"
              onClick={handleClearCart}
              className="text-xs font-medium text-muted transition-colors hover:text-danger"
            >
              Clear cart
            </button>
          </div>
          <ul className="divide-y divide-line">
            {cartItems.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>
        </div>

        {/* ---------- summary ---------- */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold">Order summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">
                  Subtotal ({count} item{count === 1 ? "" : "s"})
                </dt>
                <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd
                  className={
                    shipping === 0
                      ? "font-medium text-success"
                      : "font-medium text-ink"
                  }
                >
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </dd>
              </div>
            </dl>

            {remainingForFree > 0 && (
              <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-accent">
                Add {formatPrice(remainingForFree)} more for free shipping.
              </p>
            )}

            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="text-2xl font-extrabold tracking-tight text-ink">
                {formatPrice(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              className="btn btn-primary mt-5 w-full py-3"
            >
              <ShoppingBag size={17} strokeWidth={1.9} />
              Place order
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheck size={14} className="text-success" />
              Secure checkout &middot; 30-day returns
            </p>

            <Link
              to="/"
              className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-body transition-colors hover:text-accent"
            >
              <ArrowLeft size={14} />
              Continue shopping
            </Link>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
            <Truck size={18} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs leading-5 text-muted">
              Free standard delivery on orders over $
              {FREE_SHIPPING_THRESHOLD}. Dispatched within 24 hours.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Cart;
