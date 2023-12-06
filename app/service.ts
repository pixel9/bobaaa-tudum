async function apiRequest(path, params) {
  const url = `https://api.yelp.com/v3/businesses/${path}?${new URLSearchParams(
    params
  )}`;

  const results = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.YELP_TOKEN}`,
      Accept: "application/json",
    },
  }).then((res) => res.json());

  //   console.log({ results });

  if (results.error) {
    console.error(results.error.code);
    throw new Error(results.error.code);
  }

  return results;
}

export async function findBoba(location, sort_by, limit = 5) {
  return apiRequest("search", {
    location,
    term: "boba",
    radius: "10000",
    sort_by: sort_by || "best_match",
    limit,
  });
}
