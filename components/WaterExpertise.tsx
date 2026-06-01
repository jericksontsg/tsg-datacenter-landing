type CapabilityProps = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const ThermometerIcon = (
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
    <path d="M14 4a2 2 0 0 0-4 0v10.5a4 4 0 1 0 4 0V4z" />
    <path d="M12 8v6" />
  </svg>
);

const RecycleIcon = (
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
    <path d="M7 19l-3-3 3-3" />
    <path d="M4 16h7" />
    <path d="M17 5l3 3-3 3" />
    <path d="M20 8h-7" />
    <path d="M9 8l3-5 3 5" />
    <path d="M15 16l-3 5-3-5" />
  </svg>
);

const DropletIcon = (
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
    <path d="M12 2.5c-3.5 4.5-7 8-7 12a7 7 0 0 0 14 0c0-4-3.5-7.5-7-12z" />
  </svg>
);

const GaugeIcon = (
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
    <path d="M12 13l4-4" />
    <circle cx="12" cy="13" r="9" />
    <path d="M3 13h2" />
    <path d="M19 13h2" />
    <path d="M12 4v2" />
  </svg>
);

export default function WaterExpertise() {
  return (
    <section className="w-full bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-blue">
          OUR APPROACH
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-tsg-dark md:text-4xl lg:text-5xl">
          Reducing data-center water footprint is an engineering problem.
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-700 md:text-xl">
          Every site is different. TSG&apos;s optimization work draws on
          two decades of operating reverse-osmosis and water-treatment
          plants across mission-critical infrastructure — combined with
          deep knowledge of the four variables that actually drive
          data-center water use: heat-rejection architecture, climate,
          source-water chemistry, and the regulatory environment. We
          engineer the right solution for the site, not the one we&apos;re
          trying to sell.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Capability
            icon={ThermometerIcon}
            title="Heat-rejection design"
            body="Matching wet-tower, hybrid, or dry-cooler, to an economizer or chiller (for example mechanical vapor or absorption) architecture based on the site's climate and load profile. The dominant lever for total water draw and energy consumption — the right architecture can shift intake by an order of magnitude before any reuse is even considered."
          />
          <Capability
            icon={RecycleIcon}
            title="Reuse and closed-loop"
            body="Recovering cooling-tower blowdown back into the makeup loop with appropriately-sized pretreatment. Where discharge limits demand it, full zero-liquid-discharge with onsite biological and thermal stages."
          />
          <Capability
            icon={DropletIcon}
            title="Alternative source water"
            body="When municipal supply is constrained, contested, or unreliable: brackish groundwater RO, seawater RO, treated municipal effluent, captured stormwater. Usually a combination tailored to the site's hydrology and permit landscape."
          />
          <Capability
            icon={GaugeIcon}
            title="Operations and chemistry"
            body="Cycles-of-concentration tuning, scale and biofouling control, real-time loss detection. We protect water performance across the operating life of the plant — not just at commissioning."
          />
        </div>
      </div>
    </section>
  );
}

function Capability({ icon, title, body }: CapabilityProps) {
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
