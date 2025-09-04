"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useMsal } from "@azure/msal-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function DemoPage() {
  const [statusA, setStatusA] = useState("");
  const [statusB, setStatusB] = useState("");
  const [groups, setGroups] = useState<string[]>([]);

  const { instance } = useMsal();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // 1) Read session storage FIRST (most reliable after redirect)
    const flag = sessionStorage.getItem("m365Reauth");
    if (flag) {
      setStatusB(
        flag === "success" ? "M365 verified ✓" : "M365 verification failed ✗"
      );
    }

    const raw = sessionStorage.getItem("m365Groups");
    if (raw) {
      try {
        setGroups(JSON.parse(raw));
      } catch {
        // ignore parse errors
      }
    }

    // 2) Fallback: read query param, persist it, then clean URL
    const qp = searchParams.get("reauth");
    if (qp && !flag) {
      const ok = qp === "success";
      setStatusB(ok ? "M365 verified ✓" : "M365 verification failed ✗");
      sessionStorage.setItem("m365Reauth", ok ? "success" : "fail");
    }

    // 3) Final fallback: if MSAL has an account cached, treat as verified
    if (!flag && !qp) {
      const accts = instance.getAllAccounts();
      if (accts.length) setStatusB("M365 verified ✓");
    }

    // 4) Clean the URL after paint (remove ?reauth=…)
    if (qp) setTimeout(() => router.replace("/"), 50);
  }, [instance, searchParams, router]);

  async function onActionA() {
    setStatusA("Opening RDP Connection…");
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStatusA("Done ✓");
    } catch {
      setStatusA("Failed ✗");
    }
  }

  // Microsoft Entra re-auth
  async function onActionB() {
    setStatusB("Redirecting to Microsoft…");
    await instance.loginRedirect({
      scopes: ["openid", "profile", "email"], // identity-only
      prompt: "login", // encourage fresh sign-in
      redirectUri: `${window.location.origin}/auth/microsoft/callback`,
    });
  }

  return (
    <main className={styles.container}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>Droplet Call Demo</h1>

        <div className={styles.grid}>
          <button className={styles.btn} onClick={onActionA}>
            No Auth
          </button>
          <button className={styles.btn} onClick={onActionB}>
            Auth
          </button>
        </div>

        <pre className={styles.status}>
          {`Action A: ${statusA || "idle"}
Auth (M365): ${statusB || "idle"}
Groups: ${groups.length ? groups.slice(0, 6).join(", ") : "(none yet)"}`}
        </pre>
      </div>
    </main>
  );
}
