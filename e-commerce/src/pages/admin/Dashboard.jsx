import useAuth from "../../hooks/useAuth";

const Dashboard = () => {
  const { userPrinciple } = useAuth();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Admin dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Welcome back, {userPrinciple?.name || "Admin"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Manage your store, products, and orders from one place.
        </p>
      </div>
    </section>
  );
};

export default Dashboard;
