import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Mail, Lock } from "lucide-react";
import useAuth from "../hooks/useAuth";

const initStates = {
  email: "",
  password: "",
};

const Login = () => {
  const [formData, setFormData] = useState(initStates);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleInpChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formSubmitHandler = (e) => {
    e.preventDefault();
    loginUser(formData.email, formData.password);
    console.log("Form Submitted!", formData);
    toast.success("Form Submitted!");
    navigate("/dashboard/admin");
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white shadow-sm shadow-brand-600/30">
            e
          </span>
          <h1 className="mt-4 text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to continue shopping.
          </p>
        </div>

        <form className="space-y-4" onSubmit={formSubmitHandler} method="POST">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Your email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInpChange}
                className="w-full rounded-control border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Your password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInpChange}
                placeholder="••••••••"
                className="w-full rounded-control border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-body">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-line text-accent focus:ring-brand-500"
              />
              Remember me
            </label>
            <a
              href="#"
              className="text-sm font-medium text-accent hover:underline"
            >
              Lost password?
            </a>
          </div>

          <button type="submit" className="btn btn-primary w-full py-2.5">
            Login to your account
          </button>

          <p className="text-center text-sm text-muted">
            Not registered?{" "}
            <Link
              to="/register"
              className="font-medium text-accent hover:underline"
            >
              Create account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
