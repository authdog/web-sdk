// import { NextResponse, type NextRequest } from "next/server";
// import { fetchUserData, getPublicKeyPayload, getTokenFromUri, browserCookiesOptions, validatePublicKey } from "../sdkUtils";

// export async function updateSession(request: NextRequest) {
//     const response = NextResponse.next();
//     const publicKey = process.env.PK_AUTHDOG as string;

//     validatePublicKey(publicKey);

//     // Decode Base64-encoded publicKey
//     const publicKeyObj = getPublicKeyPayload(publicKey);
//     const tokenFromUri = getTokenFromUri(request?.url);

//     if (tokenFromUri) {
//         const userData = await fetchUserData(publicKey, tokenFromUri);
//         if (userData?.meta && userData?.meta?.code === 200) {
//             response.cookies.set({
//                 name: `user_session_${publicKeyObj?.environmentId}`,
//                 value: JSON.stringify(userData?.user),
//                 ...browserCookiesOptions,
//             });

//             response.cookies.set({
//                 name: `user_session_hash_${publicKeyObj?.environmentId}`,
//                 value: tokenFromUri,
//                 ...browserCookiesOptions,
//             });
//         }
//     }
//     return response;
// }

