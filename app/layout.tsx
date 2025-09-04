import type { Metadata } from "next";
import AmplifyAuthGate from "./AmplifyAuthGate";
import Msal from "./msal-provider"; // keep your MSAL wrapper
import "./globals.css";

export const metadata: Metadata = {
  title: "Droplet Demo",
  description: "Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AmplifyAuthGate>
          <Msal>{children}</Msal>
        </AmplifyAuthGate>
      </body>
    </html>
  );
}
