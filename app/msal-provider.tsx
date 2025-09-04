"use client";

import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const pca = new PublicClientApplication({
  auth: {
    clientId: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID!, // from .env.local
    authority: `https://login.microsoftonline.com/${
      process.env.NEXT_PUBLIC_MSAL_TENANT_ID ?? "common"
    }`,
    redirectUri:
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/microsoft/callback`
        : undefined,
    postLogoutRedirectUri: "/",
  },
  cache: { cacheLocation: "sessionStorage", storeAuthStateInCookie: false },
});

export default function Msal({ children }: { children: React.ReactNode }) {
  return <MsalProvider instance={pca}>{children}</MsalProvider>;
}
