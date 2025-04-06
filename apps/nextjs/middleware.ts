import { NextRequest } from "next/server";
import {authenticateRequest} from "@authdog/nextjs-app/dist/index.server";

export async function middleware(request: NextRequest): Promise<Response> {
    return authenticateRequest(request as any);
}

export const config = {
    matcher: [
      "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};