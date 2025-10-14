import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import '../index.css';
import { Loader2 } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Max Volts SPA</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <section className="flexCol">
      <Loader2 className="animate-spin h-6 w-6 mx-auto mt-20 text-mv-orange" />
    </section>
  );
}

export default function Root() {
  return <Outlet />;
}
