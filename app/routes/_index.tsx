import React from "react";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { findBoba } from "../service";

const PAGE_SIZE = 10;
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
  const sortBy = url.searchParams.get("sortBy");
  const pages = parseInt(url.searchParams.get("pages") || "1", 10);

  const offices = officeId
    ? OFFICES.filter(({ id }) => id === officeId)
    : OFFICES;

  const results = await Promise.all(
    offices.map(({ address }) => findBoba(address, sortBy, pages * PAGE_SIZE))
  ).then((results) => ({
    total: results.flatMap((x) => x.total).reduce((sum, x) => sum + x, 0),
    businesses: results.flatMap((x) => x.businesses),
  }));

  return json(results);
}

export default function BobaSearch() {
  const navigation = useNavigation();
  const results = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const officeId = searchParams.get("officeId") || "";
  const sortBy = searchParams.get("sortBy") || "";

  return (
    <div className="left-0 right-0 top-0 bottom-0 absolute">
      <Form method="get" className="flex flex-col h-full">
        <nav className="bg-slate-200 py-3 px-6 flex flex-row space-x-3">
          <select
            name="officeId"
            defaultValue={officeId}
            onChange={(e) => submit(e.currentTarget.form)}
            className="mt-2 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="">All Locations</option>

            {OFFICES.map((office) => (
              <option key={office.label} value={office.id}>
                {office.label}
              </option>
            ))}
          </select>

          <select
            name="sortBy"
            defaultValue={sortBy}
            onChange={(e) => submit(e.currentTarget.form)}
            className="mt-2 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="best_match">Best Match</option>
            <option value="rating">Sort by rating</option>
            <option value="distance">Sort by distance</option>
          </select>
        </nav>

        <main className="py-3 px-6 overflow-auto flex-1">
          {navigation.state === "loading" && <div>Loading...</div>}
          <SearchResults results={results} />
        </main>
      </Form>
    </div>
  );
}

function ShowMore({ count, total }) {
  const navigation = useNavigation();
  const pages = Math.ceil(count / PAGE_SIZE);

  if (count >= total || pages * PAGE_SIZE >= 50) return null;
  if (navigation.state === "loading") {
    return <div className="text-center p-3">Loading more results...</div>;
  }

  return (
    <button
      type="submit"
      name="pages"
      value={pages + 1}
      className="w-full text-center p-3 text-blue-600"
    >
      Show More
    </button>
  );
}

function SearchResults({ results }) {
  const { businesses, total } = results;

  return (
    <div className="divide-y">
      {businesses.map((match) => (
        <SearchResult key={match.id} match={match} />
      ))}
      <ShowMore count={businesses.length} total={total} />
    </div>
  );
}

function SearchResult({ match }) {
  const { name, url, rating, review_count, distance } = match;

  return (
    <div>
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
