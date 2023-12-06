import React from "react";
import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, LiveReload } from "@remix-run/react";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="left-0 right-0 top-0 bottom-0 absolute">
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
