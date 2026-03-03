# Next.js Guide for Movie Browser (Interview Prep)

This project uses **Next.js 15** with the **App Router**. Below are the concepts you need to work effectively in this codebase.

---

## 1. App Router and file-based routing

- Routes are defined by the **folder structure** under `src/app/`.
- A **`page.tsx`** file is the UI for that route; a **`layout.tsx`** wraps child routes and persists across navigations.
- **URL → file** in this project:
  - `/` → `src/app/page.tsx`
  - `/movies/new` → `src/app/movies/new/page.tsx`
  - `/movies/123` → `src/app/movies/[id]/page.tsx` (dynamic segment)
  - `/movies/123/edit` → `src/app/movies/[id]/edit/page.tsx`

You never configure routes in code; adding `app/foo/bar/page.tsx` automatically creates the route `/foo/bar`.

---

## 2. Server vs Client components

By default, **every component is a Server Component**: it runs only on the server. To use React state, effects, or browser APIs, you must mark the file as a **Client Component** with `"use client"` at the top.

| Where | Type | Why |
|-------|------|-----|
| `app/layout.tsx` | Server | No interactivity; wraps the whole app. |
| `app/page.tsx` (list) | **Client** | Uses `useState`, `useEffect`, and form handlers. |
| `app/movies/[id]/page.tsx` (detail) | Server | Fetches data on server, no local state. |
| `app/movies/[id]/edit/page.tsx` | Client | Form state and event handlers. |
| `app/movies/[id]/DeleteButton.tsx` | Client | `onClick` and async delete. |
| `lib/actions.ts` | Server | Server Actions (see below). |

Rule of thumb: use Server by default; add `"use client"` only when you need hooks or DOM events.

---

## 3. Server Actions

**Server Actions** are async functions that run only on the server. They are called from the client (e.g. from a form or `onClick`) and can mutate data and use server-only APIs (DB, env, etc.).

- Defined in files with **`'use server'`** at the top (e.g. `src/lib/actions.ts`).
- In this app they are used for:
  - **getMovies(params)** – list/search with filter, sort, pagination
  - **getMovieById(id)** – single movie for detail page
  - **createMovie**, **updateMovie**, **deleteMovie** – mutations

Example from the list page (Client Component):

```ts
const data = await getMovies({ page: 1, query: searchQuery });
```

Even though `page.tsx` is a client component, `getMovies` runs on the server. Next.js serializes the arguments and return value so the client can call it like a normal async function.

After a mutation, the app uses **revalidatePath** and **redirect** so the user sees fresh data and the right URL.

---

## 4. Layout

- **`app/layout.tsx`** is the root layout: it wraps every page with `<html>`, `<body>`, and global CSS.
- It exports **metadata** (title, description) for the whole app.
- Layouts do not re-render on client navigation; only the `page.tsx` segment changes.

---

## 5. Navigation: `Link` and `useRouter`

- Use **`<Link href="...">`** from `next/link` for declarative navigation (no full page reload).
- Use **`useRouter()`** from `next/navigation` when you need to redirect in code (e.g. after delete: `router.push('/')`).
- **Dynamic routes**: link to `/movies/${movie.id}` or `/movies/${movie.id}/edit`.

---

## 6. Data flow in this app (one full trace)

Example: **user opens list, then searches**.

1. **Client** (`app/page.tsx`): `useEffect` runs, calls `getMovies({ page: currentPage, query: searchQuery })`.
2. **Server** (`lib/actions.ts`): `getMovies` runs on the server. It calls `movieStore.searchMovies(query)` or `movieStore.getAllMovies()`.
3. **Server** (`lib/movieStore.ts`): Uses Drizzle to query SQLite (or Fuse.js for search). Returns raw movie data.
4. **Server** (`lib/actions.ts`): Applies filter/sort/pagination from `lib/utils.ts`, then returns `{ movies, page, totalPages, ... }`.
5. **Client** (`app/page.tsx`): Receives the result, `setMovies(data.movies)`, `setTotalPages(data.totalPages)`, etc., and re-renders the list.

For **detail page** (`/movies/[id]`):

1. **Server** (`app/movies/[id]/page.tsx`): Async component; receives `params` (Promise), awaits `params`, then calls `getMovieById(id)`.
2. **Server** (`lib/actions.ts`): `getMovieById` calls `movieStore.getMovieById(id)` and returns the movie or null.
3. **Server** (`app/movies/[id]/page.tsx`): Renders the movie or an error; no client-side fetch.

---

## 7. Dynamic route params

In **App Router**, `page.tsx` and `layout.tsx` receive **`params`** as a **Promise** (Next.js 15).

- **Server Component** (e.g. detail page): `const resolvedParams = await params; const id = resolvedParams.id;`
- **Client Component** (e.g. edit page): use the `use()` hook: `const resolvedParams = use(params);`

So you always resolve the Promise once, then read `id` (or other segment names) from it.

---

## 8. Quick reference

| Concept | In this project |
|--------|------------------|
| Add a new page | Add `app/your-route/page.tsx`. |
| Add interactivity (state, effects) | Put `"use client"` at top of the file. |
| Call server from client | Call an async function from a `'use server'` file (e.g. `getMovies`, `updateMovie`). |
| Run code only on server | Keep it in a Server Component or inside a Server Action. |
| Link to another page | `<Link href="/movies/1">...</Link>`. |
| Redirect after action | In a Server Action: `redirect('/')` or `revalidatePath('/')` then redirect. |

Once you’re comfortable with: (1) file-based routes, (2) Server vs Client and `"use client"`, and (3) Server Actions for data and mutations, you can navigate and extend this codebase confidently.
