import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Pre-launch gate: HTTP Basic Auth on every request except Next.js
 * internal assets. Lets the team share the URL for review without
 * exposing the site to the open internet while content is in flux.
 *
 * To open the site to the public, delete this file and redeploy.
 * To rotate credentials, edit USER / PASS below or move them to env
 * vars (recommended once the password is no longer trivial).
 */
const USER = "TSG";
const PASS = "TSG";
const REALM = "TSG Preview";

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice(6);
    try {
      const decoded = atob(encoded);
      const sep = decoded.indexOf(":");
      const user = sep === -1 ? decoded : decoded.slice(0, sep);
      const pwd = sep === -1 ? "" : decoded.slice(sep + 1);
      if (user === USER && pwd === PASS) {
        return NextResponse.next();
      }
    } catch {
      // malformed header — fall through to 401
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}"`,
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  // Protect everything except Next.js internal assets so the page
  // still styles and loads correctly after the user authenticates.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
