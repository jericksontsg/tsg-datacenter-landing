type StepProps = {
  number: number;
  title: string;
  body: string;
};

export default function HowWeEngage() {
  return (
    <section className="w-full bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-blue">
          PROCESS
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-tsg-dark md:text-4xl lg:text-5xl">
          From inquiry to engineering — fast.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step
            number={1}
            title="Assessment Call"
            body="We scope your water source, quality targets, volume requirements, and timeline in one focused session."
          />
          <Step
            number={2}
            title="Preliminary Design + Budget"
            body="Conceptual system design and Class 4 cost estimate delivered within 2–3 weeks."
          />
          <Step
            number={3}
            title="EPC Proposal"
            body="Fixed-price EPC contract with performance guarantees. TSG owns delivery through commissioning."
          />
        </div>
      </div>
    </section>
  );
}

function Step({ number, title, body }: StepProps) {
  return (
    <div>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tsg-blue font-display text-2xl font-bold text-white">
        {number}
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold text-tsg-dark">
        {title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-slate-700">{body}</p>
    </div>
  );
}
