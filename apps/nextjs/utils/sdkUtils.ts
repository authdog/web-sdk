interface PublicKeyPayload {
    environmentId: string;
    identityHost: string;
}

export const getPublicKeyPayload = (publicKey: string): PublicKeyPayload => {
    if (!publicKey) {
        throw new Error("Public key is not defined");
    }
    
    if (!publicKey.startsWith("pk_")) {
        throw new Error("Invalid public key");
    }
    
    try {
        // Decode Base64-encoded publicKey
        return JSON.parse(
            Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8")
        );
    } catch (e) {
        throw new Error("Failed to parse public key");
    }
};

export const getTokenFromUri = (url: string): string | null => {
    return new URL(url).searchParams.get("token");
}

interface IFetchUserData {
    user: {
        id: string;
        environmentId: string;
        externalId: string;
        userName: string;
        displayName: string;
        nickName: string;
        profileUrl: string;
        title: string;
        userType: string;
        preferredLanguage: string | null;
        locale: string | null;
        timezone: string | null;
        active: boolean;
        provider: string;
        lastLogin: string;
        createdAt: string;
        updatedAt: string;
        names: {
            id: string;
            userId: string;
            formatted: string | null;
            familyName: string;
            givenName: string;
            middleName: string | null;
            honorificPrefix: string | null;
            honorificSuffix: string | null;
            createdAt: string;
            updatedAt: string;
        };
        addresses: [];
        emails: {
            value: string;
            primary: boolean;
            type: string;
        }[];
        phoneNumbers: [];
        ims: [];
        photos: {
            value: string;
            type: string;
        }[];
    };
    meta: {
        code: number;
        message: string;
    };
}


export const validatePublicKey = (publicKey: string) => {
    if (!publicKey) {
        throw new Error("Public key is not defined");
    }

    if (!publicKey.startsWith("pk_")) {
        throw new Error("Invalid public key");
    }
}

export const fetchUserData = async (publicKey: string, token: string): Promise<IFetchUserData|null> => {
    validatePublicKey(publicKey);
    const publicKeyObj = getPublicKeyPayload(publicKey);
    const userData = await fetch(
        `${publicKeyObj?.identityHost}/oidc/${publicKeyObj?.environmentId}/userinfo`,
        {
            headers: {
                authorization: `Bearer ${token}`,
            },
        }
    );

    if (!userData.ok) {
        throw new Error("Failed to fetch user info");
    }

    return await userData.json();
}

export const browserCookiesOptions = {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    httpOnly: true,
};

/* nextjs */
import { cookies } from "next/headers";

export const getSessionCookie = async (publicKey: string) => {
    if (!publicKey) {
        throw new Error("Public key is not defined");
    }

    const publicKeyObj = getPublicKeyPayload(publicKey);
    const cookieStore: any = await cookies();
    return cookieStore.get(`user_session_${publicKeyObj?.environmentId}`);
}