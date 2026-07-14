# FOODISTAR

FOODISTAR is a Next.js, TypeScript, Tailwind CSS, and Framer Motion food ordering website. The old Express, MongoDB, Razorpay, and Vite stack has been removed.

## What Is Included

- Next.js App Router with TypeScript
- Tailwind CSS v4 styling
- Framer Motion page and card animation
- Firebase Authentication with email/password and Google sign-in
- Firebase Storage uploads for owner menu item images
- Role-aware user, owner, and delivery profiles
- Menu browsing, category filters, search, favorites, cart, checkout, and local order history
- Cash order request checkout with no online gateway

## Firebase

Firebase is initialized in `lib/firebase.ts` with the supplied FOODISTAR project:

```ts
const firebaseConfig = {
  apiKey: "AIzaSyAn1Paw2vhn089IbbttzoUb6Txqs2DdCc0",
  authDomain: "foodystar-3d903.firebaseapp.com",
  projectId: "foodystar-3d903",
  storageBucket: "foodystar-3d903.firebasestorage.app",
  messagingSenderId: "802523323966",
  appId: "1:802523323966:web:30e8d7a55cc30ddcd2fb6f",
  measurementId: "G-8FYSMTY9VW"
};
```

Enable these providers in the Firebase Console:

- Email/password authentication
- Google authentication
- Firebase Storage

## Data Note

MongoDB has been removed. The current app keeps catalog changes, cart data, favorites, roles, and orders in browser `localStorage`, while uploaded owner images are stored in Firebase Storage. This makes the site run without a backend. For production multi-user data sync, add Firestore or another database later.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start the local Next.js dev server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run the Next.js linter

## Main Files

```text
app/
  page.tsx
  signin/page.tsx
  signup/page.tsx
  forgot-password/page.tsx
  cart/page.tsx
  checkout/page.tsx
  orders/page.tsx
  owner/page.tsx
  favorites/page.tsx
  profile/page.tsx
components/
  app-provider.tsx
  auth-screen.tsx
  food-card.tsx
  protected-page.tsx
  site-nav.tsx
lib/
  catalog.ts
  firebase.ts
  types.ts
public/food/
  copied food imagery from the original project
```
