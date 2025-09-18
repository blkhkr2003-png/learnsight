import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/student", "/teacher", "/parent"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for authentication token (in production, verify JWT)
    const authToken = request.cookies.get("auth-token");

    if (!authToken) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect root to appropriate dashboard based on role
  if (pathname === "/" && request.cookies.get("user-role")) {
    const role = request.cookies.get("user-role")?.value;
    if (role === "student")
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    if (role === "teacher")
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    if (role === "parent")
      return NextResponse.redirect(new URL("/parent/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
