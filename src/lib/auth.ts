import { cookies } from "next/headers";

const COOKIE_NAME = "sodade_session";

export interface SessionData {
    userId: number;
    email: string;
    accountType: "personal" | "professional";
}

export async function setAuthCookie(data: SessionData) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(data), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 días
    });
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getAuthUser(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    try {
        return JSON.parse(raw) as SessionData;
    } catch {
        return null;
    }
}