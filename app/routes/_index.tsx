import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { findBoba } from "../service";
import { useState } from "react";

const OFFICES = [
  {
    id: 1,
    label: "Headquarters",
    address: "121 Albright Way, Los Gatos, CA 95032",
  },
  { id: 2, label: "NY Office", address: "888 Broadway, New York, NY 10003" },
  {
    id: 3,
    label: "LA Office",
    address: "5808 Sunset Blvd, Los Angeles, CA 90028",
  },
];

export async function loader() {
  const results = await Promise.all(
    OFFICES.map(({ address }) => findBoba(address))
  );
  return json(results);
}

export default function BobaSearch() {
  const results = useLoaderData<typeof loader>();
  const matches = results.flatMap((result) => result.businesses);

  return (
    <div>
      <nav className="bg-slate-200 py-3 px-6 flex flex-row justify-between">
        <select>
          <option value="">All Locations</option>
          {OFFICES.map((office, i) => (
            <option key={office.label} value={office.id}>
              {office.label} - {results[i].total} matches
            </option>
          ))}
        </select>
        <div>{matches.length} search results</div>
      </nav>
      <main className="py-3 px-6">
        {matches.map((match) => (
          <SearchResult match={match} />
        ))}
      </main>
    </div>
  );
}

function SearchResult({ match }) {
  const { name, url, rating, review_count, distance } = match;

  return (
    <div className="rounded p-3 shadow-sm">
      <a href={url} className="text-blue-600">
        {name}
      </a>
      <div className="text-sm">
        <Rating stars={rating} reviews={review_count} />
        <Distance distance={distance} />
      </div>
    </div>
  );
}

function Rating({ stars, reviews }) {
  return (
    <span>
      {stars} stars ({reviews} reviews)
    </span>
  );
}

function Distance({ distance }) {
  const miles = distance / 1609;
  return <span>~{Math.round(miles)} miles</span>;
}
