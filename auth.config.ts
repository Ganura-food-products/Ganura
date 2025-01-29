import type { NextAuthConfig } from "next-auth";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const cookie = (await cookies()).get("session")?.value;
      const session = await decrypt(cookie);

      const isAdmin = session?.role === "admin";
      const isAccountant = session?.role === "accountant";
      const isNormalUser = session?.role === "user";
      const isOnLogin = nextUrl.pathname === "/login";

      const isOnCreateEdit =
        nextUrl.pathname.includes("/create") ||
        nextUrl.pathname.includes("/edit") ||
        nextUrl.pathname.includes("/users");
      const isOnValidForAccountant =
        nextUrl.pathname.startsWith("/dashboard/invoices") ||
        nextUrl.pathname.startsWith("/dashboard/customers") ||
        nextUrl.pathname.endsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/dashboard/unauthorized");

      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard && !isLoggedIn) {
        return false;
      }
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (isLoggedIn) {
        if (isAccountant) {
          if (isOnValidForAccountant) return true;
          return Response.redirect(new URL("/dashboard/unauthorized", nextUrl));
        }
        if (isOnCreateEdit) {
          if (isNormalUser) {
            return Response.redirect(
              new URL("/dashboard/unauthorized", nextUrl)
            );
          }
          return true;
        }
        if (!isOnDashboard) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
