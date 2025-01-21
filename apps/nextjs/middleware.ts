import { NextRequest } from "next/server";
import {authenticateRequest} from "@authdog/nextjs-app"
// import { updateSession } from "./utils/sdk/middleware";

export async function middleware(request: NextRequest) {
    return authenticateRequest(request);
}

export const config = {
    matcher: [
      "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};