export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-br from-white via-white to-tsg-light/50 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-tsg-dark sm:text-5xl md:text-6xl lg:text-7xl">
          Data Centers Are Thirsty.{" "}
          <span className="block font-display font-bold text-tsg-blue sm:inline">
            We Keep Them Running.
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-700 md:text-xl">
          TSG Water Resources delivers engineered water treatment systems for
          mission-critical data center infrastructure — on compressed
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
