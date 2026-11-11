const WrappingChild = () => {
  return (
    <section className="mx-auto w-full max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">WrappingChild</h1>
        <p className="mt-2 text-sm text-muted">
          A simple example of passing children into a wrapper component.
        </p>

        <Parent>
          <Child data="Apple" />
          <Child data="Mango" />
          <Child data="Pomegranate" />
          <Child data="Papaya" />
        </Parent>
      </div>
    </section>
  );
};

export default WrappingChild;

const Parent = ({ children }) => {
  return (
    <ul className="mt-5 ml-5 list-disc space-y-1.5 text-sm text-body marker:text-brand-500">
      {children}
    </ul>
  );
};

const Child = ({ data }) => {
  return <li>{data}</li>;
};
