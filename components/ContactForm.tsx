export default function ContactForm() {
  return (
    <section id="contact" className="w-full bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-blue">
          GET STARTED
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-tsg-dark md:text-4xl lg:text-5xl">
          Your water infrastructure timeline starts today.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Form */}
          <form
            name="tsg-datacenter-contact"
            method="POST"
            data-netlify="true"
            className="rounded-lg bg-white p-6 shadow-sm md:p-8"
          >
            <input
              type="hidden"
              name="form-name"
              value="tsg-datacenter-contact"
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="firstName" label="First Name" />
              <Field id="lastName" label="Last Name" />
              <Field id="company" label="Company" className="sm:col-span-2" />
              <Field
                id="email"
                label="Email"
                type="email"
                className="sm:col-span-2"
              />
              <Field
                id="phone"
                label="Phone"
                type="tel"
                className="sm:col-span-2"
              />

              <SelectField
                id="location"
                label="Project Location"
                className="sm:col-span-2"
                options={["USA", "Caribbean", "Mexico", "Other"]}
              />
              <SelectField
                id="capacity"
                label="Approximate Capacity"
                options={["<10MW", "10-50MW", "50-200MW", "200+MW"]}
              />
              <SelectField
                id="timeline"
                label="Timeline"
                options={[
                  "Under 6mo",
                  "6-12mo",
                  "12-24mo",
                  "Planning stage",
                ]}
              />
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-tsg-blue px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark sm:w-auto"
            >
              Start My Assessment →
            </button>
          </form>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm md:p-8">
              <h3 className="font-display text-xl font-bold text-tsg-dark">
                Direct Contact
              </h3>
              <p className="mt-3 text-base text-slate-700">
                <a
                  href="mailto:info@tsgwater.com"
                  className="text-tsg-blue hover:underline"
                >
                  info@tsgwater.com
                </a>
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Miami FL · Caribbean · Mexico City
              </p>
            </div>

            <div className="rounded-lg border-l-4 border-tsg-blue bg-white p-6 shadow-sm md:p-8">
              <h3 className="font-display text-xl font-bold text-tsg-dark">
                What to expect
              </h3>
              <ul className="mt-4 space-y-3 text-base text-slate-700">
                <ExpectItem>Response within 1 business day</ExpectItem>
                <ExpectItem>30-min discovery call</ExpectItem>
                <ExpectItem>
                  Preliminary assessment in 2–3 weeks
                </ExpectItem>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  type = "text",
  className = "",
}: {
  id: string;
  label: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-tsg-blue focus:outline-none focus:ring-1 focus:ring-tsg-blue"
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  options,
  className = "",
}: {
  id: string;
  label: string;
  options: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue=""
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-tsg-blue focus:outline-none focus:ring-1 focus:ring-tsg-blue"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function ExpectItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <svg
        className="mt-1 h-5 w-5 flex-shrink-0 text-tsg-blue"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}
