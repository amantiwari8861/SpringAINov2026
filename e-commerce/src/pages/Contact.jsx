import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "react-toastify";

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thanks! We'll get back to you shortly.");
    e.target.reset();
  };

  const details = [
    { icon: Mail, label: "Email", value: "support@ecommerce.com" },
    { icon: Phone, label: "Phone", value: "+1 (555) 000-1234" },
    { icon: MapPin, label: "Address", value: "123 Market Street, New York" },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Contact us
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          We&apos;d love to hear from you
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
          Questions about an order or a product? Send us a message and our team
          will reply within one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {details.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="subject"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="How can we help?"
              className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="message"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              placeholder="Write your message..."
              className="w-full resize-none rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            />
          </div>

          <button type="submit" className="btn btn-primary mt-6 w-full py-2.5">
            Send message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
