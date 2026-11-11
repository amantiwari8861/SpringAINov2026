import { Link } from "react-router";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/Cart";

const ProductCard = ({ product }) => {
  const rate = Math.round(product?.rating?.rate || 0);
  const dispatch = useDispatch();
  const handleAddToCart = () => {
    dispatch(addToCart(product));
    toast.success(`${product?.title?.slice(0, 32) || "Item"} added to cart`);
  };

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-900/5">
      <Link
        to={`product/${product?.id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-canvas p-6"
      >
        {product?.category && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent shadow-sm backdrop-blur">
            {product.category}
          </span>
        )}
        <img
          className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          src={
            product?.image ||
            "https://v3.flowbite.com/images/products/apple-watch.png"
          }
          title={product?.title}
          alt={product?.description || product?.title || "Product image"}
          loading="lazy"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`product/${product?.id}`} className="group/title">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover/title:text-accent">
            {product?.title || "No title available"}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <div
            className="flex items-center gap-0.5"
            aria-label={`${rate} out of 5`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                strokeWidth={1.5}
                className={
                  i < rate ? "fill-star text-star" : "fill-line text-line"
                }
              />
            ))}
          </div>
          <span className="text-xs font-medium text-muted">
            {product?.rating?.rate || 0}
          </span>
          {product?.rating?.count != null && (
            <span className="text-xs text-slate-400">
              ({product.rating.count})
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-xl font-bold tracking-tight text-ink">
            ${Number(product?.price || 0).toFixed(2)}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1.5 rounded-control bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-brand-600/25 transition-colors hover:bg-brand-500"
          >
            <ShoppingCart size={14} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
