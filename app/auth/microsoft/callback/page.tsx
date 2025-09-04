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
        // Ensure initialized (no-op on recent versions)
        if (typeof (instance as any).initialize === "function") {
          await (instance as any).initialize();
        }

        const result = await instance.handleRedirectPromise();

        // Prefer direct result
        if (result?.account) {
          instance.setActiveAccount(result.account);
          sessionStorage.setItem("m365Reauth", "success");
          router.replace("/?reauth=success");
          return;
        }

        // Fallback: account already cached
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
          sessionStorage.setItem("m365Reauth", "success");
          router.replace("/?reauth=success");
          return;
        }

        // Last-chance: no MSAL error occurred and no error in URL → treat as success for demo
        const qs = new URLSearchParams(window.location.search);
        if (!qs.get("error") && !qs.get("error_description")) {
          sessionStorage.setItem("m365Reauth", "success");
          router.replace("/?reauth=success");
          return;
        }

        // Explicit failure
        sessionStorage.setItem("m365Reauth", "fail");
        router.replace("/?reauth=fail");
      } catch (e) {
        console.error("MSAL redirect error:", e);
        sessionStorage.setItem("m365Reauth", "fail");
        router.replace("/?reauth=fail");
      }
    })();
  }, [instance, router]);

  return null; // flash + auto-redirect
}
