// lib/auth-client.ts (Client-side configuration)

"use client";

import { createAuthClient } from "better-auth/react";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: `${getBaseUrl()}/api/auth`,
});

export const { useSession, signIn, signOut } = authClient;
