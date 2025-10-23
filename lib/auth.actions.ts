// lib/actions/auth.actions.ts

"use server";

import { signIn } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validation/schemas";

type RedirectError = { digest: string };
function isRedirectError(error: unknown): error is RedirectError {
  return (
    error != null &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as RedirectError).digest === "string"
  );
}

type NextAuthError = { type: string };
function isNextAuthError(error: unknown): error is NextAuthError {
  return (
    error != null &&
    typeof error === "object" &&
    "type" in error &&
    typeof (error as NextAuthError).type === "string"
  );
}

export async function authenticate(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return { error: "Invalid email or password format provided." };
  }

  try {
    await signIn.email({
      email,
      password,
      callbackURL: "/dashboard-redirect",
    });

    return { success: true };
  } catch (error) {
    if (isNextAuthError(error)) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials. Please check your email and password." };
        default:
          return { error: "An unexpected authentication error occurred. Please try again." };
      }
    }

    if (isRedirectError(error) && error.digest.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Critical Login Error:", error);
    return { error: "Login failed due to a server error. Check server logs for details." };
  }
}
