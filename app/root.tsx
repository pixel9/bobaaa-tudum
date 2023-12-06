import React from "react";
import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import { LiveReload } from "@remix-run/react";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1 className="text-center">Bobaaa! (TUDUM)</h1>
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
