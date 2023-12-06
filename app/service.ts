function apiRequest(path, params) {
  const url = `https://api.yelp.com/v3/businesses/${path}?${new URLSearchParams(
    params
  )}`;

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.YELP_TOKEN}`,
      Accept: "application/json",
    },
  }).then((res) => res.json());
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
