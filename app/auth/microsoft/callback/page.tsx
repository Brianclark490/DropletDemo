"use client";

import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MicrosoftCallback() {
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // Safe even if already initialized
        // @ts-ignore
        if (typeof (instance as any).initialize === "function") {
          // @ts-ignore
          await (instance as any).initialize();
        }

        const result = await instance.handleRedirectPromise();
        const account = result?.account ?? instance.getAllAccounts()[0];
        if (!account) throw new Error("No account after redirect");
        instance.setActiveAccount(account);

        // Prefer groups from the result/account claims (no extra token call)
        let groups: string[] =
          (result?.idTokenClaims as any)?.groups ??
          ((account as any).idTokenClaims?.groups as string[] | undefined) ??
          [];

        // Last attempt: try silent token, ignore errors
        if (groups.length === 0) {
          try {
            const token = await instance.acquireTokenSilent({
              account,
              scopes: ["openid", "profile"],
            });
            groups = ((token?.idTokenClaims as any)?.groups as string[]) ?? [];
          } catch {}
        }

        console.log("MSAL OK. groups:", groups);
        sessionStorage.setItem("m365Groups", JSON.stringify(groups));
        sessionStorage.setItem("m365Reauth", "success");
        router.replace("/?reauth=success");
      } catch (e) {
        console.error("MSAL callback error:", e);
        sessionStorage.setItem("m365Reauth", "fail");
        router.replace("/?reauth=fail");
      }
    })();
  }, [instance, router]);

  return null; // flash + auto-redirect
}
