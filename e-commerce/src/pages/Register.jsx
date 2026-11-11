import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../hooks/useAuth";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
    <path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.23c1.89-1.74 2.99-4.3 2.99-7.37Z" />
    <path d="M12 22c2.7 0 4.96-.9 6.61-2.4l-3.23-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.1H3.07v2.6A10 10 0 0 0 12 22Z" />
    <path d="M6.41 13.94A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.94v-2.6H3.07A10 10 0 0 0 2 12c0 1.63.39 3.17 1.07 4.54l3.34-2.6Z" />
    <path d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86C16.95 2.99 14.7 2 12 2a10 10 0 0 0-8.93 5.46l3.34 2.6c.79-2.35 2.99-4.1 5.59-4.1Z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
    <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.2 3.23.92.1-.72.39-1.2.7-1.48-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 9h5.16v12H2.4V9Zm6.9 0h4.94v1.64h.07c.69-1.2 2.37-2.47 4.88-2.47 5.22 0 6.18 3.14 6.18 7.23V21h-5.15v-5.06c0-1.21-.02-2.77-1.9-2.77-1.9 0-2.19 1.32-2.19 2.68V21H9.3V9Z" />
  </svg>
);

const initStates = {
  fname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initStates,
    mode: "onBlur",
  });
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const password = watch("password");

  const formSubmitHandler = async (formData) => {
    const { confirmPassword: _confirmPassword, ...registrationData } = formData;
    registerUser(formData.fname, formData.email, formData.password);
    console.log("Form Submitted!", registrationData);
    toast.success("Form Submitted!");
    navigate("/login");
  };

  const inputClass = (field) =>
    `block w-full rounded-control border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-brand-500/15 ${
      errors[field]
        ? "border-danger focus:border-danger"
        : "border-line focus:border-brand-500"
    }`;

  const errorClass = "mt-1 text-xs leading-4 text-danger";

  const visibilityButtonClass =
    "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-accent";

  const socialButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-body transition hover:bg-brand-50 hover:text-accent";

  return (
    <section className="flex w-full justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface px-6 py-7 shadow-sm">
        {/* Brand */}
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-brand-600 font-display text-lg font-extrabold text-white shadow-sm shadow-brand-600/30">
            e
          </span>
          <h1 className="mt-4 text-2xl font-bold">Create an account</h1>
          <p className="mt-1 text-sm text-muted">
            Join us and start shopping today.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(formSubmitHandler)}
          noValidate
        >
          {/* Full Name */}
          <div>
            <input
              id="fname"
              type="text"
              autoComplete="name"
              placeholder="Full Name"
              aria-invalid={Boolean(errors.fname)}
              aria-describedby={errors.fname ? "fname-error" : undefined}
              className={inputClass("fname")}
              {...register("fname", {
                required: "Full name is required!",
                minLength: {
                  value: 2,
                  message: "Name must contain at least 2 characters!",
                },
                maxLength: {
                  value: 30,
                  message: "Name cannot exceed 30 characters!",
                },
                pattern: {
                  value: /^[A-Za-z ]+$/,
                  message: "Only alphabets and spaces are allowed!",
                },
              })}
            />

            {errors.fname && (
              <p id="fname-error" role="alert" className={errorClass}>
                {errors.fname.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="E-mail address"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClass("email")}
              {...register("email", {
                required: "Email is required!",
                maxLength: {
                  value: 254,
                  message: "Email cannot exceed 254 characters!",
                },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address!",
                },
              })}
            />

            {errors.email && (
              <p id="email-error" role="alert" className={errorClass}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`${inputClass("password")} pr-9`}
                {...register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 8,
                    message: "Password must contain at least 8 characters!",
                  },
                  maxLength: {
                    value: 50,
                    message: "Password cannot exceed 50 characters!",
                  },
                  pattern: {
                    value: /^[A-Za-z0-9 !$@.#^-]+$/,
                    message: "Use only letters, numbers, spaces and !$@.#^-",
                  },
                })}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={visibilityButtonClass}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.password && (
              <p id="password-error" role="alert" className={errorClass}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
                className={`${inputClass("confirmPassword")} pr-9`}
                {...register("confirmPassword", {
                  required: "Please confirm your password!",
                  validate: (value) =>
                    value === password || "Passwords don't match",
                })}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className={visibilityButtonClass}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                role="alert"
                className={errorClass}
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Sign Up */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full py-2.5"
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>

          {/* Terms and Privacy */}
          <p className="pt-0.5 text-center text-xs leading-5 text-muted">
            By continuing, you agree to{" "}
            <Link to="/terms" className="text-accent hover:underline">
              Terms
            </Link>{" "}
            &amp;{" "}
            <Link to="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Sign In */}
          <p className="text-center text-xs text-muted">
            Have an account?{" "}
            <Link
              to="/login"
              className="ml-1 font-medium text-accent hover:underline"
            >
              Sign In
            </Link>
          </p>

          {/* Social Login */}
          <div className="pt-1">
            <p className="mb-3 text-center text-xs text-muted">
              or you can sign in with
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Sign in with Google"
                onClick={() => toast.info("Google sign-in coming soon")}
                className={socialButtonClass}
              >
                <GoogleIcon />
              </button>

              <button
                type="button"
                aria-label="Sign in with GitHub"
                onClick={() => toast.info("GitHub sign-in coming soon")}
                className={socialButtonClass}
              >
                <GithubIcon />
              </button>

              <button
                type="button"
                aria-label="Sign in with LinkedIn"
                onClick={() => toast.info("LinkedIn sign-in coming soon")}
                className={socialButtonClass}
              >
                <LinkedinIcon />
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Register;
