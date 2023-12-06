import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { findBoba } from "../service";

const LOCATIONS = [
  { label: "Headquarters", address: "121 Albright Way, Los Gatos, CA 95032" },
  { label: "NY Office", address: "888 Broadway, New York, NY 10003" },
  { label: "LA Office", address: "5808 Sunset Blvd, Los Angeles, CA 90028" },
];

export async function loader() {
  const results = await Promise.all(
    LOCATIONS.map(({ address }) => findBoba(address))
  );
  return json(results);
}

export default function BobaSearch() {
  const results = useLoaderData<typeof loader>();

  return (
    <div>
      <ul>
        {LOCATIONS.map((location, i) => (
          <li key={location.label}>
            {location.label} - {results[i].total} matches
          </li>
        ))}
      </ul>
    </div>
  );
}
