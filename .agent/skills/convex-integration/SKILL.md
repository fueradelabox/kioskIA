---
name: Convex Integration
description: Guide for integrating Convex with Magic Link authentication (Resend) into a React + Vite project
---

# SKILL: Convex Integration Guide

This guide provides the definitive workflow for integrating Convex with Magic Link authentication, ensuring a scalable and modern setup.

---

## 1. Project Initialization & Dependencies
Start by setting up the Convex environment.

```bash
# 1. Initialize Convex
npx convex dev

# 2. Install Auth & Peer Dependencies (Latest)
npm install convex @convex-dev/auth @auth/core lucide-react --save --legacy-peer-deps
```
*Note: If you experience "Connection lost" backend crashes, see the Troubleshooting section about pinning `@auth/core@0.37.0`.*

---

## 2. Environment Configuration (Dashboard)
Configure these variables in the **Convex Dashboard** (Settings > Environment Variables):

| Variable | Source | Purpose |
| :--- | :--- | :--- |
| `AUTH_RESEND_KEY` | [Resend.com](https://resend.com) | Sending Magic Link emails |
| `SITE_URL` | Your App URL | Local: `http://localhost:3000` / Prod: `https://myapp.com` |
| `JWT_PRIVATE_KEY` | Generated | RSA Private Key for signing session tokens |
| `JWKS` | Generated | Match for the Private Key (Public key set) |

---

## 3. Backend Implementation (`convex/`)

### A. Define Schema (`schema.ts`)
Merge the authentication tables with your custom tables.
```typescript
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Your custom tables here
});
```

### B. Auth Logic (`auth.ts`)

#### ✅ The Standard Way (Try this first)
```typescript
import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@auth/core/providers/resend";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Resend],
});
```

#### 🛡️ The Defensive Fallback (Use only if Standard Way crashes)
*If the backend crashes with "Connection lost" or dependency errors, use this manual fetch implementation to bypass problematic library code.*

```typescript
import { convexAuth } from "@convex-dev/auth/server";

const ResendProvider = {
  id: "resend",
  type: "email" as const,
  name: "Resend",
  async sendVerificationRequest({ identifier: to, url }: any) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to,
        subject: `Sign in to your app`,
        html: `<p>Click <a href="${url}">here</a> to sign in.</p>`,
      }),
    });
    if (!res.ok) throw new Error("Resend failed: " + (await res.text()));
  },
};

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [ResendProvider],
});
```

### C. Mandatory Config (`auth.config.ts`)
Without this file, sessions will not persist.
```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

### D. Secure HTTP Routes (`http.ts`)
```typescript
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);
export default http;
```

---

## 4. Frontend Integration

### A. Provider Setup (`index.tsx`)
```tsx
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
// Wrap App
<ConvexAuthProvider client={convex}><App /></ConvexAuthProvider>
```

### B. Implementation Hooks
- **Sign In/Out**: `const { signIn, signOut } = useAuthActions();`
- **Protection**: Use `<Authenticated>`, `<Unauthenticated>`, and `<AuthLoading>` in your Router.

---

## 5. Troubleshooting (Master List)

- **Crash: "Connection lost"**: Known issue in some Convex runtimes with latest Auth.js. **Fix**: Pin `@auth/core@0.37.0` AND use the **Defensive Fallback** (Section 3B).
- **Error: "No auth provider found"**: Check `auth.config.ts` exists and `domain` matches `CONVEX_SITE_URL`.
- **Error: "Invalid Signature"**: Manual `JWT_PRIVATE_KEY` and `JWKS` mismatch. Regenerate together as a pair.
- **Infinite Loading**: Ensure `auth.addHttpRoutes(http)` is exported in `http.ts`.
