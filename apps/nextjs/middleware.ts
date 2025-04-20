import { NextRequest } from "next/server";
import { useAuthMiddleware } from "@authdog/nextjs-app/server";

export async function middleware(request: NextRequest): Promise<Response> {
  return useAuthMiddleware(process.env.PK_AUTHDOG)(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
