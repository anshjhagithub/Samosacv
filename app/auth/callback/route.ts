import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const nextFromQuery = searchParams.get("next");
  const nextFromCookie = request.cookies.get("samosa_oauth_next")?.value;

  const next =
    (nextFromQuery ?? nextFromCookie ?? "/").startsWith("/")
      ? (nextFromQuery ?? nextFromCookie ?? "/")
      : "/";

  // Prepare response early so cookies can attach correctly
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Clear redirect cookie
      response.cookies.set("samosa_oauth_next", "", {
        path: "/",
        maxAge: 0,
      });

      return response;
    }
  }

  // If anything fails, redirect back with error
  return NextResponse.redirect(
    `${origin}/?auth_error=Could%20not%20sign%20in`
  );
}