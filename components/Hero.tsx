export default function Hero() {
  return (
    <section className="w-full bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-tsg-dark sm:text-5xl md:text-6xl lg:text-7xl">
              Data Centers Are Thirsty.{" "}
              <span className="block font-display font-bold text-tsg-blue sm:inline">
                We Keep Them Running.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-700 md:text-xl">
              TSG Water Resources delivers engineered water treatment systems
              for mission-critical data center infrastructure — on compressed
              timelines, in any geography.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-md bg-tsg-blue px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark"
              >
                Get a Project Assessment
              </a>
              <a
                href="#capabilities"
                className="inline-flex items-center justify-center rounded-md border-2 border-tsg-blue px-6 py-3 text-base font-medium text-tsg-blue transition hover:bg-tsg-light"
              >
                Download Capabilities Sheet
              </a>
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <DataCenterGraphic />
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-3 border-t border-slate-200 pt-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-6">
          <span>USA · Caribbean · Mexico</span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span>20+ Years EPC Experience</span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span>Mission-Critical Timelines</span>
        </div>
      </div>
    </section>
  );
}

/**
 * Stylized data-center illustration for the hero. A row of server racks
 * (LEDs, U-unit indicators, "ONLINE" status bar) sit between an
 * animated chilled-water supply pipe above and a warm-water return
 * pipe below — the cooling loop a data center buyer recognizes
 * instantly, with TSG's water angle baked into the iconography.
 *
 * Pure inline SVG + CSS keyframes from globals.css (.flow-anim,
 * .flow-anim-fast, .ops-pulse). No JS, no image assets.
 */
function DataCenterGraphic() {
  return (
    <div
      role="img"
      aria-label="Illustration of a data-center hall with chilled-water supply and return cooling loop"
    >
      <svg
        viewBox="0 0 600 400"
        className="h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Supply pipe label */}
        <text
          x="300"
          y="22"
          textAnchor="middle"
          fill="#64748b"
          fontSize="11"
          fontWeight="700"
          letterSpacing="2.5"
        >
          CHILLED WATER · SUPPLY
        </text>

        {/* Top supply pipe with animated flow */}
        <g>
          <rect
            x="20"
            y="34"
            width="560"
            height="22"
            rx="4"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <line
            x1="30"
            y1="45"
            x2="570"
            y2="45"
            stroke="#0069b4"
            strokeWidth="3"
            strokeDasharray="8 6"
            className="flow-anim"
          />
        </g>

        {/* Server-rack array (5 racks, 80w with 20px gaps, centered) */}
        <g transform="translate(60, 84)">
          <ServerRack x={0} variant={0} />
          <ServerRack x={100} variant={1} />
          <ServerRack x={200} variant={2} />
          <ServerRack x={300} variant={3} />
          <ServerRack x={400} variant={4} />
        </g>

        {/* Bottom return pipe with animated flow */}
        <g>
          <rect
            x="20"
            y="326"
            width="560"
            height="22"
            rx="4"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <line
            x1="30"
            y1="337"
            x2="570"
            y2="337"
            stroke="#378ADD"
            strokeWidth="3"
            strokeDasharray="14 4"
            className="flow-anim-fast"
          />
        </g>

        {/* Return pipe label */}
        <text
          x="300"
          y="368"
          textAnchor="middle"
          fill="#64748b"
          fontSize="11"
          fontWeight="700"
          letterSpacing="2.5"
        >
          WARM WATER · RETURN
        </text>

        {/* Attribution */}
        <text
          x="300"
          y="392"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9"
          fontWeight="500"
          letterSpacing="0.5"
        >
          Engineered by TSG Water Resources
        </text>
      </svg>
    </div>
  );
}

// Pre-set LED patterns so each rack looks subtly different — feels
// like distinct workloads rather than five copies of the same image.
const LED_PATTERNS: string[][] = [
  ["#10b981", "#cbd5e1", "#10b981", "#3b82f6", "#cbd5e1", "#10b981", "#cbd5e1"],
  ["#10b981", "#10b981", "#cbd5e1", "#10b981", "#3b82f6", "#cbd5e1", "#10b981"],
  ["#cbd5e1", "#10b981", "#3b82f6", "#cbd5e1", "#10b981", "#10b981", "#cbd5e1"],
  ["#10b981", "#cbd5e1", "#10b981", "#cbd5e1", "#10b981", "#3b82f6", "#10b981"],
  ["#3b82f6", "#10b981", "#cbd5e1", "#10b981", "#cbd5e1", "#10b981", "#10b981"],
];

// Which LED index gets the pulsing "ops-pulse" animation per rack.
const PULSING_LED_INDEX = [0, 3, 1, 5, 2];

function ServerRack({ x, variant }: { x: number; variant: number }) {
  const leds = LED_PATTERNS[variant];
  const pulseIdx = PULSING_LED_INDEX[variant];
  return (
    <g transform={`translate(${x}, 0)`}>
      {/* Outer chassis */}
      <rect
        x="0"
        y="0"
        width="80"
        height="232"
        rx="3"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />

      {/* ONLINE status bar */}
      <rect x="6" y="6" width="68" height="11" rx="2" fill="#10b981" />
      <text
        x="40"
        y="15"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="7"
        fontWeight="700"
        letterSpacing="1"
      >
        ONLINE
      </text>

      {/* U-unit divider lines */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line
          key={i}
          x1="8"
          y1={30 + i * 14}
          x2="72"
          y2={30 + i * 14}
          stroke="#e2e8f0"
          strokeWidth="0.8"
        />
      ))}

      {/* LEDs (7 down the left side) */}
      {leds.map((color, i) => (
        <circle
          key={i}
          cx="13"
          cy={32 + i * 26}
          r="2.2"
          fill={color}
          className={i === pulseIdx ? "ops-pulse" : undefined}
        />
      ))}

      {/* U labels on right side */}
      <text x="63" y="34" fill="#94a3b8" fontSize="6" fontWeight="600">
        U1
      </text>
      <text x="63" y="86" fill="#94a3b8" fontSize="6" fontWeight="600">
        U5
      </text>
      <text x="63" y="138" fill="#94a3b8" fontSize="6" fontWeight="600">
        U9
      </text>
      <text x="63" y="190" fill="#94a3b8" fontSize="6" fontWeight="600">
        U13
      </text>

      {/* Base plinth */}
      <rect x="2" y="220" width="76" height="8" rx="1" fill="#e2e8f0" />
    </g>
  );
}
