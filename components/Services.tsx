type ServiceCardProps = {
  title: string;
  body: string;
  badge?: { label: string; tone: "teal" | "muted" };
  className?: string;
  variant?: "default" | "muted";
};

export default function Services() {
  return (
    <section className="w-full bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-blue">
          SERVICES
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-tsg-dark md:text-4xl lg:text-5xl">
          Full-spectrum water treatment for data center operators.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <ServiceCard
            title="BWRO / Brackish Water Treatment"
            body="High-recovery brackish groundwater treatment for inland campuses where municipal supply is constrained or unavailable."
          />
          <ServiceCard
            title="Cooling Tower Makeup Water"
            body="Treated source water to minimize scaling, biofouling, and chemical consumption in large-scale evaporative cooling systems."
          />
          <ServiceCard
            title="Wastewater Reuse / ZLD"
            body="Close the loop. Recover and reuse cooling tower blowdown to reduce freshwater draw and meet increasingly strict discharge regulations."
            badge={{ label: "ESG Impact", tone: "teal" }}
          />
          <ServiceCard
            title="O&M Services"
            body="24/7 staffed operations and remote monitoring for critical water infrastructure. SLA-backed. Uptime-focused."
          />
          <ServiceCard
            title="Ultrapure Water (UHP) Systems"
            body="Semiconductor-grade water for direct liquid cooling and precision manufacturing support facilities."
            badge={{ label: "Specialized Engagements", tone: "muted" }}
            className="md:col-span-2"
            variant="muted"
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  title,
  body,
  badge,
  className = "",
  variant = "default",
}: ServiceCardProps) {
  const base =
    variant === "muted"
      ? "rounded-md border-2 border-dashed border-slate-300 bg-slate-100/60 p-6 text-slate-700"
      : "rounded-md bg-white p-6 shadow-sm";
  return (
    <div className={`${base} ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-2xl font-bold text-tsg-dark">
          {title}
        </h3>
        {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      </div>
      <p className="mt-3 text-base leading-relaxed text-slate-700">{body}</p>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "teal" | "muted";
}) {
  const styles =
    tone === "teal"
      ? "bg-teal-100 text-teal-800"
      : "bg-slate-200 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}
