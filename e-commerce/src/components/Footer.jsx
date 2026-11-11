import { Link } from "react-router";

const iconClass = "h-4 w-4";
const currentYear = new Date().getFullYear();

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClass}>
    <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.6H7.5V14h2.4v8h3.6Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={iconClass}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClass}>
    <path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.2l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.7 2h6.3l4.5 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClass}>
    <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.48-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={iconClass}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 9h5.16v12H2.4V9Zm6.9 0h4.94v1.64h.07c.69-1.2 2.37-2.47 4.88-2.47 5.22 0 6.18 3.14 6.18 7.23V21h-5.15v-5.06c0-1.21-.02-2.77-1.9-2.77-1.9 0-2.19 1.32-2.19 2.68V21H9.3V9Z" />
  </svg>
);

const footerLinks = [
  {
    heading: "Shop",
    links: [
      { label: "Home", to: "/" },
      { label: "Services", to: "/services" },
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & returns", to: "/services" },
      { label: "Track your order", to: "/contact" },
      { label: "FAQs", to: "/about" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", to: "#" },
      { label: "Terms & conditions", to: "#" },
    ],
  },
];

const socials = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: TwitterIcon, label: "Twitter" },
  { icon: GithubIcon, label: "GitHub" },
  { icon: LinkedinIcon, label: "LinkedIn" },
];

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-line bg-surface text-body">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
                e
              </span>
              eCommerce
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
              Everyday essentials, thoughtful finds, and the things you love —
              all in one place.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-canvas text-muted transition-colors hover:bg-brand-600 hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                {column.heading}
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-body transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="my-8 border-line" />

        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
          <p>© {currentYear} eCommerce. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Secure checkout &amp; free delivery over $50
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
