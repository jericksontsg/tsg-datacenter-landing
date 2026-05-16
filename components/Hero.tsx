export default function Hero() {
  return (
    <section className="w-full bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
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
            <FlowGraphic />
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
 * Decorative animated SVG depicting raw water flowing into an RO
 * treatment vessel and treated water flowing out to a data center.
 * Pure CSS keyframe animations (no JS), defined in globals.css.
 */
function FlowGraphic() {
  return (
    <div
      role="img"
      aria-label="Animated diagram showing raw water flowing into reverse-osmosis treatment and treated water flowing out to a data center"
    >
      <svg
        viewBox="0 0 480 320"
        className="h-auto w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* LIVE FLOW badge */}
        <g transform="translate(8, 28)">
          <circle cx="6" cy="0" r="5" fill="#10b981" className="ops-pulse" />
          <text
            x="20"
            y="4"
            fill="#64748b"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
          >
            LIVE FLOW
          </text>
        </g>

        {/* Feedwater label */}
        <text
          x="90"
          y="120"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontWeight="600"
          letterSpacing="1.5"
        >
          FEEDWATER
        </text>

        {/* Inlet pipe */}
        <rect
          x="0"
          y="145"
          width="180"
          height="40"
          rx="4"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <line
          x1="0"
          y1="145"
          x2="0"
          y2="185"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="165"
          x2="175"
          y2="165"
          stroke="#378ADD"
          strokeWidth="3"
          strokeDasharray="8 6"
          className="flow-anim"
        />

        {/* Central RO vessel */}
        <rect
          x="180"
          y="115"
          width="120"
          height="100"
          rx="50"
          fill="#e6f1fb"
          stroke="#0069b4"
          strokeWidth="2"
        />
        {/* Internal membrane indicators */}
        <line
          x1="200"
          y1="140"
          x2="280"
          y2="140"
          stroke="#0069b4"
          strokeWidth="1"
          opacity="0.45"
        />
        <line
          x1="200"
          y1="160"
          x2="280"
          y2="160"
          stroke="#0069b4"
          strokeWidth="1"
          opacity="0.45"
        />
        <line
          x1="200"
          y1="180"
          x2="280"
          y2="180"
          stroke="#0069b4"
          strokeWidth="1"
          opacity="0.45"
        />
        <line
          x1="200"
          y1="200"
          x2="280"
          y2="200"
          stroke="#0069b4"
          strokeWidth="1"
          opacity="0.45"
        />
        <text
          x="240"
          y="250"
          textAnchor="middle"
          fill="#263285"
          fontSize="11"
          fontWeight="700"
          letterSpacing="2"
        >
          RO TREATMENT
        </text>

        {/* Treated water label */}
        <text
          x="390"
          y="120"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontWeight="600"
          letterSpacing="1.5"
        >
          TO DATA CENTER
        </text>

        {/* Outlet pipe */}
        <rect
          x="300"
          y="145"
          width="180"
          height="40"
          rx="4"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <line
          x1="480"
          y1="145"
          x2="480"
          y2="185"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <line
          x1="305"
          y1="165"
          x2="470"
          y2="165"
          stroke="#0069b4"
          strokeWidth="3"
          strokeDasharray="14 4"
          className="flow-anim-fast"
        />
      </svg>
    </div>
  );
}
