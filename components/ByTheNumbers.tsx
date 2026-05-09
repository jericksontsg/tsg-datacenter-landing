export default function ByTheNumbers() {
  return (
    <section className="w-full bg-tsg-dark px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-light">
          TRACK RECORD
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          Proven at scale. Ready to deploy.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Metric value="20+" label="Years EPC Delivery" />
          <Metric value="3" label="Countries Active" />
          <Metric value="24/7" label="O&M Monitoring" />
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
      <div className="font-display text-6xl font-bold text-tsg-light md:text-7xl">
        {value}
      </div>
      <p className="mt-3 text-base font-medium uppercase tracking-wide text-white/80">
        {label}
      </p>
    </div>
  );
}
