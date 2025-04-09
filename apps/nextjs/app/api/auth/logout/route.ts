import type { NextApiRequest, NextApiResponse } from 'next'
import {cookies} from 'next/headers'
import { getPublicKeyPayload } from '@authdog/nextjs-app/src/commons';


export async function POST(req: NextApiRequest, res: NextApiResponse) {
    const cookiesStore = await cookies();

    const publicKey = process.env.PK_AUTHDOG as string;

    console.log(publicKey)
    if (!publicKey) {
        throw new Error("Public key is not defined");
    }

    const payload = getPublicKeyPayload(publicKey);
    
    const environmentId = payload.environmentId;
    const cookieNameSession = `user_session_${environmentId}`;

    const cookieValueSession = cookiesStore.get(cookieNameSession);

    if (cookieValueSession) {
        cookiesStore.delete(cookieNameSession);
    }

    const cookieNameHash = `user_session_hash_${environmentId}`;
    const cookieValueHash = cookiesStore.get(cookieNameHash);

    if (cookieValueHash) {
        cookiesStore.delete(cookieNameHash);
    }

    return new Response(JSON.stringify({
        message: 'Logout successfully',
        success: true,
    }), {
        status: 200,
        headers: {
        'Content-Type': 'application/json',
        },
    });
}