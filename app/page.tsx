"use client";

import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useMsal } from "@azure/msal-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function DemoPage() {
  const [statusA, setStatusA] = useState("");
  const [statusB, setStatusB] = useState("");
  const { instance } = useMsal();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Carry state across redirect:
  useEffect(() => {
    const qp = searchParams.get("reauth");
    if (qp) {
      setStatusB(
        qp === "success" ? "M365 verified ✓" : "M365 verification failed ✗"
      );
      router.replace("/"); // clean URL
      return;
    }

    const flag = sessionStorage.getItem("m365Reauth");
    if (flag) {
      setStatusB(
        flag === "success" ? "M365 verified ✓" : "M365 verification failed ✗"
      );
      sessionStorage.removeItem("m365Reauth");
      return;
    }

    // Fallback: if MSAL already has an account in cache, treat as verified
    const accounts = instance.getAllAccounts();
    if (accounts.length) setStatusB("M365 verified ✓");
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

  async function onActionB() {
    setStatusB("Redirecting to Microsoft…");
    await instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      prompt: "login",
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
Auth (M365): ${statusB || "idle"}`}
        </pre>
      </div>
    </main>
  );
}
