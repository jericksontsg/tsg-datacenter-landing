"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Loose type for the Turnstile global. Cloudflare's runtime API:
// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
type TurnstileGlobal = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Render Turnstile widget when the script and the container are both ready.
  // Polls briefly because the script may load after first paint.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    let attempts = 0;

    const tryRender = () => {
      if (cancelled) return;
      attempts += 1;
      if (
        typeof window !== "undefined" &&
        window.turnstile &&
        widgetRef.current &&
        !widgetIdRef.current
      ) {
        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          "error-callback": () => setTurnstileToken(null),
          theme: "light",
        });
      } else if (attempts < 60) {
        setTimeout(tryRender, 200);
      }
    };
    tryRender();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const formData = new FormData(e.currentTarget);
    setFirstName((formData.get("firstName") as string) || "");
    const payload = {
      ...Object.fromEntries(formData),
      ...(turnstileToken ? { turnstileToken } : {}),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
        // Reset the Turnstile widget so the user can re-verify on retry.
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
          setTurnstileToken(null);
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // The submit button is disabled while loading, OR (when Turnstile is
  // configured) until the user has been verified.
  const turnstileBlocking = Boolean(TURNSTILE_SITE_KEY) && !turnstileToken;
  const submitDisabled = loading || turnstileBlocking;

  return (
    <section id="contact" className="w-full bg-slate-50 px-6 py-20">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}
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

              {/* Cloudflare Turnstile widget — only rendered when the
                  site key env var is set. Container is left empty
                  otherwise so layout doesn't shift. */}
              {TURNSTILE_SITE_KEY && (
                <div className="mt-6">
                  <div ref={widgetRef} />
                </div>
              )}

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
                disabled={submitDisabled}
                className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-tsg-blue px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading
                  ? "Sending…"
                  : turnstileBlocking
                    ? "Verifying you're human…"
                    : "Start My Assessment →"}
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
                USA · The Caribbean · Mexico
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
