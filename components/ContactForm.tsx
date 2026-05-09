"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [firstName, setFirstName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const formData = new FormData(e.currentTarget);
    setFirstName((formData.get("firstName") as string) || "");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

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
          {/* Left column: form OR success card */}
          {submitted ? (
            <SuccessCard firstName={firstName} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-lg bg-white p-6 shadow-sm md:p-8"
            >
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

              {error && (
                <p className="mt-6 text-sm text-red-600">
                  Something went wrong. Please email us directly at{" "}
                  <a
                    href="mailto:info@tsgwater.com"
                    className="underline hover:text-red-700"
                  >
                    info@tsgwater.com
                  </a>
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-tsg-blue px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Sending…" : "Start My Assessment →"}
              </button>
            </form>
          )}

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
                <ExpectItem>Preliminary assessment in 2–3 weeks</ExpectItem>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SuccessCard({ firstName }: { firstName: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-8 shadow-sm md:p-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
        <svg
          className="h-7 w-7 text-emerald-600"
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
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold text-tsg-dark">
        Thank you{firstName ? `, ${firstName}` : ""}.
      </h3>
      <p className="mt-3 text-base leading-relaxed text-slate-700">
        We&apos;ll be in touch within 1 business day.
      </p>
      <p className="mt-2 text-sm text-slate-600">
        In the meantime, you can reach us at{" "}
        <a
          href="mailto:info@tsgwater.com"
          className="text-tsg-blue hover:underline"
        >
          info@tsgwater.com
        </a>
        .
      </p>
    </div>
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
