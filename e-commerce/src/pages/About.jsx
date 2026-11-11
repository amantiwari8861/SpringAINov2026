import { Link } from "react-router";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Heart,
  ArrowRight,
  Sparkles,
  Headphones,
  RotateCcw,
} from "lucide-react";

const categories = [
  {
    title: "Fashion & Clothing",
    description: "Everyday outfits, trending styles, and timeless essentials.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Electronics",
    description: "Smart gadgets and technology for everyday life.",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Accessories",
    description: "The finishing touches that make every look yours.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Home & Living",
    description: "Thoughtful essentials to make your space feel special.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Quality You Can Trust",
    description:
      "We focus on bringing you carefully selected products that meet our quality standards.",
  },
  {
    icon: Truck,
    title: "Convenient Delivery",
    description:
      "Shop from home and get your orders delivered right to your doorstep.",
  },
  {
    icon: RotateCcw,
    title: "Easy Shopping Experience",
    description:
      "Enjoy a simple shopping journey, from browsing products to placing your order.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "We're here to help with your questions and make your shopping experience better.",
  },
];

export default function About() {
  return (
    <main className="bg-canvas text-ink">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-12 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-body shadow-sm">
              <Sparkles size={16} className="text-accent" />
              Discover a better way to shop
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Everything you love,
              <span className="block text-accent">all in one place.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-body sm:text-lg">
              From the latest fashion and everyday essentials to electronics,
              accessories, and home finds, we're here to make discovering your
              next favorite thing easier.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-control bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-500"
              >
                Explore Products
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-control border border-line bg-surface px-6 py-3.5 font-semibold text-ink transition hover:border-brand-300 hover:text-accent"
              >
                Contact Us
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-body">
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                Quality-focused selection
              </span>
              <span className="flex items-center gap-2">
                <Heart size={18} className="text-rose-500" />
                Shopping made simple
              </span>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
              alt="Modern retail store with clothing and merchandise"
              className="h-[350px] w-full rounded-3xl object-cover shadow-xl sm:h-[480px]"
              loading="eager"
            />

            <div className="absolute -bottom-5 left-4 rounded-2xl border border-line bg-surface p-4 shadow-lg sm:left-8 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-accent">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <p className="font-semibold">Your everyday marketplace</p>
                  <p className="mt-1 text-sm text-muted">
                    Explore. Discover. Enjoy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Our Story
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Shopping should feel effortless.
          </h2>

          <p className="mt-6 text-base leading-8 text-body">
            We believe finding the right products shouldn't be complicated.
            That's why our store brings together a variety of categories in one
            convenient destination. Whether you're refreshing your wardrobe,
            upgrading your gadgets, or finding something special for your home,
            we're here to help you discover more.
          </p>

          <p className="mt-4 text-base leading-8 text-body">
            Our focus is simple: offer a convenient way to browse products, make
            informed choices, and enjoy shopping with confidence.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-12 lg:py-24 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
                What We Offer
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Something for everyone.
              </h2>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 font-semibold text-body transition hover:text-accent"
            >
              Browse all products
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <article
                key={category.title}
                className="group overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    loading="lazy"
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold">{category.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {category.description}
                  </p>
                  <Link
                    to="/"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                  >
                    Discover more
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Why Choose Us
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            More than just a store.
          </h2>
          <p className="mt-4 leading-7 text-muted">
            We aim to make every step of your shopping journey convenient,
            transparent, and enjoyable.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-accent">
                <Icon size={26} />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center text-white sm:px-12 sm:py-16">
          <ShoppingBag size={34} className="mx-auto text-brand-300" />

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Find something you'll love.
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Explore our collections and discover products for your lifestyle,
            your home, and your everyday needs.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-control bg-brand-600 px-6 py-3.5 font-semibold text-white transition hover:bg-brand-500"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
