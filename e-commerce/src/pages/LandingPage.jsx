import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import { useEffect, useState } from "react";

const LandingPage = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        setProductList(data);
      } catch (error) {
        console.log("Something Went Wrong :" + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <HeroSlider />

      <div className="mb-6 mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Shop the collection
          </p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
            Featured products
          </h2>
        </div>
        {!loading && (
          <span className="text-sm text-muted">
            {productList.length} items available
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-line bg-surface"
            >
              <div className="h-44 rounded-t-2xl bg-line/60" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-4/5 rounded bg-line/60" />
                <div className="h-4 w-3/5 rounded bg-line/60" />
                <div className="h-8 w-full rounded-lg bg-line/60" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {productList.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
