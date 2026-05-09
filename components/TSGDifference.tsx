type CardProps = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const BoltIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  </svg>
);

const ToolIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M14.7 6.3a4 4 0 015.4 5.4l-9 9a2 2 0 01-2.8-2.8l9-9z" />
    <path d="M3 21l3.5-3.5" />
  </svg>
);

const GlobeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);

export default function TSGDifference() {
  return (
    <section className="w-full bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-blue">
          WHY TSG
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-tsg-dark md:text-4xl lg:text-5xl">
          Built for the speed of infrastructure deployment.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card
            icon={BoltIcon}
            title="Speed-to-Water"
            body="Purpose-built EPC delivery for data center timelines. We've engineered systems where no utility infrastructure exists."
          />
          <Card
            icon={ToolIcon}
            title="EPC + O&M Under One Roof"
            body="From design through commissioning through long-term operations — TSG owns the outcome. No handoffs."
          />
          <Card
            icon={GlobeIcon}
            title="Geography-Agnostic Execution"
            body="Water-stressed Texas to remote Caribbean islands to Mexico's tech corridors — we operate where others won't."
          />
        </div>
      </div>
    </section>
  );
}

function Card({ icon, title, body }: CardProps) {
  return (
    <div className="rounded-md border-l-4 border-tsg-blue bg-slate-50 p-6 shadow-sm">
      <div className="text-tsg-blue">{icon}</div>
      <h3 className="mt-4 font-display text-2xl font-bold text-tsg-dark">
        {title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-slate-700">{body}</p>
    </div>
  );
}
