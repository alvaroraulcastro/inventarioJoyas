import { createHmac, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export { SESSION_COOKIE };
const SESSION_DAYS = 7;

export type SessionPayload = {
  sub: string;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Falta AUTH_SECRET en las variables de entorno.");
  }
  return new TextEncoder().encode(secret);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  const hmacA = createHmac("sha256", "login").update(left).digest();
  const hmacB = createHmac("sha256", "login").update(right).digest();
  return timingSafeEqual(hmacA, hmacB) && a.length === b.length && a === b;
}

export function validateCredentials(username: string, password: string) {
  const expectedUser = process.env.AUTH_USERNAME ?? "";
  const expectedPassword = process.env.AUTH_PASSWORD ?? "";
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPassword);
}

export async function createSessionToken(username: string) {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecretKey());
}

export async function readSessionFromToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());
  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Sesión inválida");
  }
  return { sub: payload.sub } satisfies SessionPayload;
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await readSessionFromToken(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    const error = new Error("No autorizado");
    error.name = "UnauthorizedError";
    throw error;
  }
  return session;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function isUnauthorized(error: unknown) {
  return error instanceof Error && error.name === "UnauthorizedError";
}
