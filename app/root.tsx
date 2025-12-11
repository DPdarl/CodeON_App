import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Toaster } from "sonner"; // 1. IMPORT IS HERE

import "./tailwind.css";
import { AuthProvider } from "./contexts/AuthContext";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    href: "/coinv2.ico", // This now works because the file is in 'public'
    type: "image/x-icon",
  },
  {
    rel: "shortcut icon",
    href: "/coinv2.ico",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap",
  },
];

export const meta: MetaFunction = () => [{ title: "CodeON App" }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>

        {/* 2. COMPONENT IS HERE */}
        <Toaster position="bottom-center" richColors />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
