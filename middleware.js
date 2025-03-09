import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get("auth_token")?.value; 

    if (!token && !request.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/((?!admin|_next/static|_next/image|favicon.ico).*)",
};
