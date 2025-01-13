import { NextResponse, type NextRequest } from "next/server";
// cookies from next
import {cookies} from "next/headers";

const nonAuthPath = ["/login", "/register", "/email-verify"];
const protectedRoutes = ["/profile"];

export async function updateSession(request: NextRequest) {
    // Create a new response object
    const response = NextResponse.next();
  
    const options = {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        httpOnly: true,
    };

    const authenticatedUser = {
        id: 1,
        email: "toto@doe.com"
    }

    response.cookies.set({
        name: "user_session",
        value: JSON.stringify(authenticatedUser),
        ...options,
    });

    const tokenFromUri = new URL(request.nextUrl).searchParams.get("token");

    if (tokenFromUri) {
        response.cookies.set({
            name: "user_session_hash",
            value: tokenFromUri,
            ...options,
        })
    }

    return response;
}