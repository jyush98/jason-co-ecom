import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl; // Access nextUrl from the request

  if (url.pathname === "/sign-up/continue") {
    return NextResponse.redirect(new URL("/", url.origin));
  }
});

export const config = { matcher: ["/((?!_next).*)"] };