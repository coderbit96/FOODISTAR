import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/app-provider";
import { appName, appUrl, createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: appName,
    description: "RasoiGo helps you order Bengali classics, fast food, desserts, tea-time snacks, and city favorites from trusted local restaurants.",
    path: "/"
  }),
  metadataBase: new URL(appUrl),
  applicationName: appName,
  authors: [{ name: appName }],
  creator: appName,
  publisher: appName,
  category: "food delivery",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem("rasoigo:theme");
                if (theme === "dark") {
                  document.documentElement.classList.add("dark");
                }
              } catch {}
            `
          }}
        />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
