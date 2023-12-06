# bobaaa-tudum!

This is a project to fulfill the requirements for the Netflix take home exercise.

# Tech Stack

- [Remix](https://remix.run/)
  - I selected this framework for its minimal boilerplate. I used hooks around data loading to make sure the user experience was as streamlined as possible.
- [TailwindCSS](https://tailwindcss.com/)
  - Although I love to craft my own CSS, time was of the essence. Tailwind allowed me to quickly set it up and use what I needed as I prototyped. It also allows me to quickly delete unused code without gradually accumulating obsolete CSS. Plenty of examples are available to crib from at the end to polish things up if I have time.

# Summary

There are 2 files of interest in the project: `service.ts` and `routes/_index.tsx`. Everything else is boilerplate. You may be wondering about `server.mjs` but it is also just boilerplate and was added for hot reloading and to clearly demonstrate that this is a simple express-based server rendered app.

## `app/service.ts`

The main interface with the Yelp API implemented with a basic `fetch` call. Remix builds server/client code separately there's no concern for leaking the API key to the client side. The exposed API is "just enough" to implement paging.

Given more time I would have opted to fetch just the additional data for new pages of results and merge it into the UI instead of pulling the entire result set. Some of this can be mitigated by adding caching headers to the API endpoint so it's less expensive.

## `app/routes/_index.tsx`

This is the meat of the code. I opted to keep everything in a single file to make it easier to review and make changes on a single screen.

I spent time making sure that browser navigation isn't broken and state is managed via the url. You may notice a stark lack of `useState` hooks since I pull the state from the request parameters instead. Rest assured that after from the initial page load, new data and UI refreshes all happen on the client for a snappy user experience.

# Getting it up and running

Create a `.env` file and set Yelp API token value

```
YELP_TOKEN={your token here}
```

Install dependencies

```
npm install
```

Run dev server for local development and hot reloading

```
npm run dev
```

# Deployment

Build application

```
npm run build
```

Start the server

```
npm start
```
