"use client";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { useEffect, useState } from "react";

const pca = new PublicClientApplication({
  auth: {
    clientId: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID!,
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
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    pca.initialize().finally(() => mounted && setReady(true));
    return () => {
      mounted = false;
    };
  }, []);
  if (!ready) return null; // don’t render pages until MSAL is ready
  return <MsalProvider instance={pca}>{children}</MsalProvider>;
}
