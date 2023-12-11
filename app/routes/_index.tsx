import React, { Suspense } from "react";
import { defer } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
  Await,
} from "@remix-run/react";
import { findBoba } from "../service";

const CACHE_DURATION_SECONDS = 60 * 60 * 24;
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

  const results = Promise.all(
    offices.map(({ address }) => findBoba(address, sortBy, pages * PAGE_SIZE))
  ).then((results) => ({
    total: results.flatMap((x) => x.total).reduce((sum, x) => sum + x, 0),
    businesses: results.flatMap((x) => x.businesses),
  }));

  return defer(
    { results },
    {
      headers: {
        "Cache-Control": `max-age=${CACHE_DURATION_SECONDS}`,
      },
    }
  );
}

export default function BobaSearch() {
  const navigation = useNavigation();
  const { results } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const officeId = searchParams.get("officeId") || "";
  const sortBy = searchParams.get("sortBy") || "";

  return (
    <div className="left-0 right-0 top-0 bottom-0 absolute">
      <Form
        method="get"
        preventScrollReset={true}
        className="flex flex-col h-full"
      >
        <nav className="bg-slate-200 py-3 px-6 flex flex-row space-x-3 items-center align-middle border border-b-slate-400">
          <select
            name="officeId"
            defaultValue={officeId}
            onChange={(e) => submit(e.currentTarget.form)}
            className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
            className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="best_match">Best Match</option>
            <option value="rating">Sort by rating</option>
            <option value="distance">Sort by distance</option>
          </select>

          {navigation.state === "loading" && (
            <div className="text-sm">Loading...</div>
          )}
        </nav>

        <main className="py-3 px-6 overflow-auto flex-1 bg-slate-200">
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={results}>
              {(results) => <SearchResults results={results} />}
            </Await>
          </Suspense>
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
    return <div className="text-center p-6">Loading more results...</div>;
  }

  return (
    <button
      type="submit"
      name="pages"
      value={pages + 1}
      className="w-full text-center p-6 text-blue-600"
    >
      Show More
    </button>
  );
}

function SearchResults({ results }) {
  const { businesses, total } = results;

  return (
    <div className="py-3">
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {businesses.map((match) => (
          <SearchResult key={match.id} match={match} />
        ))}
      </ul>
      <ShowMore count={businesses.length} total={total} />
    </div>
  );
}

function SearchResult({ match }) {
  const {
    name,
    is_closed,
    image_url,
    url,
    rating,
    review_count,
    distance,
    location,
  } = match;

  return (
    <li className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {name}
            </h3>
            {is_closed ? (
              <span className="inline-flex flex-shrink-0 items-center rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                Closed
              </span>
            ) : (
              <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Open
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            {location.display_address.join(" ")}
          </p>
        </div>
        <img
          className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-300"
          src={image_url}
          alt=""
        />
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="flex w-0 flex-1">
            <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
              <Rating stars={rating} reviews={review_count} />
            </div>
          </div>
          <div className="-ml-px flex w-0 flex-1">
            <div className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
              <Distance distance={distance} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function Rating({ stars, reviews }) {
  return (
    <span>
      {stars} stars <span className="opacity-50 ml-4">{reviews} reviews</span>
    </span>
  );
}

function Distance({ distance }) {
  const miles = distance / 1609;
  return <span>~{Math.round(miles)} miles</span>;
}
