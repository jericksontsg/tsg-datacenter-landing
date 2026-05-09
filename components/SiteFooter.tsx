export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg font-bold text-tsg-dark">
            TSG Water Resources
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Engineering Water. Enabling Infrastructure.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <a
            href="https://tsgwater.com"
            className="hover:text-tsg-blue"
            target="_blank"
            rel="noopener noreferrer"
          >
            tsgwater.com
          </a>
          <a
            href="https://www.linkedin.com/company/tsg-water-resources"
            className="hover:text-tsg-blue"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a href="/privacy" className="hover:text-tsg-blue">
            Privacy Policy
          </a>
        </nav>
      </div>
    </footer>
  );
}
