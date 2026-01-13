import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

// Import your global CSS file if you have one (e.g., tailwind)
import stylesheet from "~/tailwind.css";
// Import your AuthProvider
import { AuthProvider } from "~/contexts/AuthContext";

<<<<<<< HEAD:app/routes/_index/route.tsx
  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth/login");
      }
    }
  }, [user, loading, navigate]);
=======
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];
>>>>>>> f9f883cb2a0868733e3506c0e915d6e1fc11d097:app/routes/_index.tsx

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* We wrap everything in AuthProvider so 'useAuth' works everywhere */}
        <AuthProvider>{children}</AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
