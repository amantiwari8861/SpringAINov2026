import { Headphones, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const services = [
  {
    icon: Truck,
    title: "Fast delivery",
    description:
      "Free standard delivery on orders over $50, dispatched within 24 hours.",
  },
  {
    icon: PackageCheck,
    title: "Easy returns",
    description:
      "Change your mind? Return any item within 30 days, no questions asked.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    description:
      "Every checkout is protected with 256-bit SSL encryption and trusted gateways.",
  },
  {
    icon: Headphones,
    title: "Customer support",
    description:
      "Real people ready to help you before, during, and after your purchase.",
  },
];

const Services = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          What we offer
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Shopping made simple
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
          From browsing to delivery, we take care of the details so you can shop
          with confidence.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-900/5"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-accent">
              <Icon size={22} strokeWidth={1.8} />
            </span>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Services;
