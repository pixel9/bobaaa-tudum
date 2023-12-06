import React from "react";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  LiveReload,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
            ? error.message
            : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
