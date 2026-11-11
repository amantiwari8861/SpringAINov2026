import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import { useSelector } from "react-redux";
import { selectCartCount } from "../redux/slices/Cart";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const cartCount = useSelector(selectCartCount);
  const { isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/data-table"
          className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-extrabold text-white shadow-sm shadow-brand-600/30">
            e
          </span>
          eCommerce
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-accent"
                      : "text-body hover:bg-brand-50 hover:text-accent"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            aria-pressed={isDark}
            className="grid h-10 w-10 place-items-center rounded-lg text-body transition-colors hover:bg-brand-50 hover:text-accent"
          >
            {isDark ? (
              <Sun size={19} strokeWidth={1.8} />
            ) : (
              <Moon size={19} strokeWidth={1.8} />
            )}
          </button>
          <Link
            to="/cart"
            aria-label={`Shopping cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="group relative grid h-10 w-10 place-items-center rounded-lg text-body transition-colors hover:bg-brand-50 hover:text-accent"
          >
            <ShoppingBag size={19} strokeWidth={1.8} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-xs font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}

            {/* Tooltip */}
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-canvas opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-1 group-hover:opacity-100">
              {cartCount > 0
                ? `${cartCount} item${cartCount > 1 ? "s" : ""} in cart`
                : "Your cart is empty"}

              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink" />
            </span>
          </Link>

          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="register" className="btn btn-primary">
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            className="grid h-10 w-10 place-items-center rounded-lg text-body transition-colors hover:bg-brand-50 hover:text-accent md:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-line bg-surface md:hidden">
          <ul className="space-y-1 px-4 py-3">
            {navLinks.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-50 text-accent"
                        : "text-body hover:bg-brand-50 hover:text-accent"
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            {!isLoggedIn && (
              <li className="flex gap-2 pt-2">
                <Link
                  to="login"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-ghost flex-1"
                >
                  Login
                </Link>
                <Link
                  to="register"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-primary flex-1"
                >
                  Register
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;

const UserMenu = () => {
  const [isDropdownMenuOpen, setDropMenuOpen] = useState(false);
  const { userPrinciple, logout } = useAuth();
  const initial = userPrinciple?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-sm font-semibold text-white ring-2 ring-transparent transition hover:ring-brand-200"
        id="user-menu-button"
        aria-expanded={isDropdownMenuOpen}
        onClick={() => setDropMenuOpen((open) => !open)}
      >
        <span className="sr-only">Open user menu</span>
        {userPrinciple?.imageUrl ? (
          <img
            className="h-full w-full object-cover"
            src={userPrinciple.imageUrl}
            alt="user photo"
          />
        ) : (
          initial
        )}
      </button>

      {isDropdownMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropMenuOpen(false)}
          />
          <div
            className="absolute right-0 z-50 mt-2 w-56 list-none divide-y divide-line rounded-xl border border-line bg-surface shadow-lg shadow-slate-900/10"
            id="user-dropdown"
          >
            <div className="px-4 py-3">
              <span className="block text-sm font-semibold text-ink">
                {userPrinciple?.name || "User"}
              </span>
              <span className="block truncate text-sm text-muted">
                {userPrinciple?.email || "user@example.com"}
              </span>
            </div>
            <ul className="py-1" aria-labelledby="user-menu-button">
              <li>
                <NavLink
                  to="/dashboard/admin"
                  className="block px-4 py-2 text-sm text-body transition-colors hover:bg-brand-50 hover:text-accent"
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/"
                  className="block px-4 py-2 text-sm text-body transition-colors hover:bg-brand-50 hover:text-accent"
                >
                  Settings
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/"
                  className="block px-4 py-2 text-sm text-body transition-colors hover:bg-brand-50 hover:text-accent"
                >
                  Earnings
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full px-4 py-2 text-left text-sm text-danger transition-colors hover:bg-rose-500/10"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
