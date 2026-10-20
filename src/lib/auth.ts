import { cookies } from "next/headers";
import { connection } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me-in-production";
const COOKIE_NAME = "wm_session";

export type SessionPayload = {
  userId: string;
  role: Role;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = signSession(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  await connection();
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session || session.role !== role) return null;
  return session;
}
