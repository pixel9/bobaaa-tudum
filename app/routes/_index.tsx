import React from "react";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { findBoba } from "../service";
import { useState } from "react";

const OFFICES = [
  {
    id: "1",
    label: "Headquarters",
    address: "121 Albright Way, Los Gatos, CA 95032",
  },
  { id: "2", label: "NY Office", address: "888 Broadway, New York, NY 10003" },
  {
    id: "3",
    label: "LA Office",
    address: "5808 Sunset Blvd, Los Angeles, CA 90028",
  },
];

export async function loader({ request }) {
  const url = new URL(request.url);
  const officeId = url.searchParams.get("officeId");
  const sortBy = url.searchParams.get("sortBy") || "rating";

  const offices = officeId
    ? OFFICES.filter(({ id }) => id === officeId)
    : OFFICES;

  const results = await Promise.all(
    offices.map(({ address }) => findBoba(address, sortBy))
  );

  return json(results);
}

export default function BobaSearch() {
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const officeId = searchParams.get("officeId");
  const sortBy = searchParams.get("sortBy");
  const results = useLoaderData<typeof loader>();
  const matches = results.flatMap((result) => result.businesses);

  const total = results
    .flatMap((result) => result.total)
    .reduce((sum, x) => sum + x, 0);

  return (
    <div className="flex flex-col h-full">
      <Form
        method="get"
        className="bg-slate-200 py-3 px-6 flex flex-row justify-between"
      >
        <select
          name="officeId"
          value={officeId || ""}
          onChange={(e) => submit(e.currentTarget.form)}
        >
          <option value="">All Locations</option>
          {OFFICES.map((office, i) => (
            <option key={office.label} value={office.id}>
              {office.label}
            </option>
          ))}
        </select>
        <select
          name="sortBy"
          value={sortBy || ""}
          onChange={(e) => submit(e.currentTarget.form)}
        >
          <option value="rating">Sort by rating</option>
          <option value="distance">Sort by distance</option>
        </select>

        <div>{total} search results</div>
      </Form>
      <main className="py-3 px-6 overflow-auto flex-1">
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
      <div className="text-sm flex flex-row space-x-3">
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
