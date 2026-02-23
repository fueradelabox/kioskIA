---
name: Convex React
description: Reference guide for the Convex React client library — queries, mutations, actions, reactivity, optimistic updates, and patterns
---

# SKILL: Convex React Client

The Convex React client library enables your React app to interact with a Convex backend: queries, mutations, actions, file storage, authentication, and full-text search.

- **Source**: [GitHub](https://github.com/get-convex/convex-js)
- **Quickstart**: Follow the [React + Vite Quickstart](https://docs.convex.dev/quickstart/react)

---

## 1. Installation

```bash
npm install convex
```

---

## 2. Connecting to a Backend

Create a `ConvexReactClient` and wrap your app with `ConvexProvider`:

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient("https://<your-domain>.convex.cloud");

reactDOMRoot.render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
);
```

> [!TIP]
> See [Configuring Deployment URL](https://docs.convex.dev/client/react/deployment-urls) for how to pass the correct URL (typically via `import.meta.env.VITE_CONVEX_URL`).

---

## 3. Fetching Data (`useQuery`)

```tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function App() {
  const data = useQuery(api.functions.myQuery);
  return data ?? "Loading...";
}
```

### With Arguments

```tsx
const data = useQuery(api.functions.myQuery, { a: "Hello", b: 4 });
```

### Skipping Queries (Conditional)

Pass `"skip"` instead of arguments to disable the query:

```tsx
const param = new URLSearchParams(window.location.search).get("param");
const data = useQuery(
  api.functions.read,
  param !== null ? { param } : "skip",
);
```

### One-Off Queries (From Callbacks)

Use `useConvex()` for imperative query calls:

```tsx
import { useConvex } from "convex/react";

const convex = useConvex();
const result = await convex.query(api.functions.myQuery);
```

### Key Properties

- **Reactive**: Components auto-rerender when underlying data changes
- **Consistent**: All `useQuery` results reflect a single database state — no partial updates
- **Subscriptions**: Created on mount, canceled on unmount

---

## 4. Editing Data (`useMutation`)

```tsx
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function App() {
  const doSomething = useMutation(api.functions.doSomething);
  return <button onClick={() => doSomething({ a: "Hello", b: 4 })}>Click me</button>;
}
```

### Response & Error Handling

```tsx
const onClick = async () => {
  try {
    const result = await doSomething();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
```

### Key Properties

- **Auto-retries**: Mutations are retried until confirmed written; each executes exactly once
- **Tab-close warning**: Users are warned if they try to close the tab with outstanding mutations
- **Optimistic updates**: Configure local, temporary query result changes for instant UI feedback — see [Optimistic Updates docs](https://docs.convex.dev/client/react/optimistic-updates)

---

## 5. Calling Third-Party APIs (`useAction`)

```tsx
import { useAction } from "convex/react";
import { api } from "../convex/_generated/api";

export function App() {
  const doSomeAction = useAction(api.functions.doSomeAction);
  return <button onClick={() => doSomeAction()}>Click me</button>;
}
```

- Arguments and error handling work the same as mutations
- Actions do **NOT** support automatic retries or optimistic updates

---

## 6. Under the Hood

The `ConvexReactClient` connects via **WebSocket** (2-way TCP), allowing Convex to push query results reactively without polling. Automatic reconnection and session re-establishment are handled on connection drops.

---

## 7. Quick Reference

| Hook | Purpose | Reactive | Retries |
|:-----|:--------|:---------|:--------|
| `useQuery` | Read data | ✅ | N/A |
| `useMutation` | Write data | Triggers re-render | ✅ |
| `useAction` | External APIs + read/write | Triggers re-render | ❌ |
| `useConvex` | Imperative access to client | ❌ | ❌ |
