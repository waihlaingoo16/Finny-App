# Finny

Finny is a personal savings and mindful-spending app. It helps people track savings goals, review planned purchases before buying, and understand confirmed spending by category. This workspace contains two clients backed by the same Supabase project:

- **Web:** React 19 and Vite, with responsive desktop and mobile-browser layouts.
- **Mobile:** React Native and Expo SDK 57, designed to run in Expo Go or an Android/iOS development environment.

Both clients use the same account, profile, savings deposits, and four-stage spending pipeline. The detailed product requirements are in [`PROJECT_SPEC.md`](PROJECT_SPEC.md).

## Features

- Email/password sign-in and account creation, with language selection kept in Settings.
- Savings goal progress, deposit history, and a savings streak on the web dashboard.
- A spending pipeline: **Wishlist → To review → Purchase → Let’s Go** (completed/archive).
- Category tags for Needs, Wants, and Emergency.
- Monthly expense totals, category ratios, budget health, and rule-based financial insights. Confirmed items in Purchase and Let’s Go count toward monthly spending; Wishlist and To review do not.
- Profile, avatar, savings goal, monthly budget, reminder preference, and language settings.
- English, Myanmar, Thai, and Japanese language choices in the web app, with Myanmar Unicode and digit normalization support.

## Project layout

```text
.
├── index.html                  # Web document and Vite entry point
├── src/
│   ├── main.jsx                # Mounts the React app
│   ├── App.jsx                 # Web auth, navigation, app state, and screen composition
│   ├── styles.css              # Web layout, responsive behavior, and visual theme
│   ├── components/
│   │   ├── Dashboard.jsx       # Web home dashboard, quote carousel, and quick actions
│   │   ├── PipelineScreen.jsx  # Web four-stage spending workflow and item editing
│   │   └── AnalyticsScreen.jsx # Web monthly totals, categories, and insights
│   └── lib/
│       ├── supabase.js         # Web Supabase client configuration
│       └── data.js             # Web local storage and Supabase data operations
├── supabase/
│   └── schema.sql              # Tables, columns, and row-level security policies
└── mobile/
    ├── App.js                  # Native authentication, tabs, screens, and data operations
    ├── app.json                # Expo app identity and SDK configuration
    ├── package.json            # Mobile dependencies and Expo commands
    └── .env.example            # Mobile Supabase environment-variable template
```

### Web source overview

- `src/main.jsx` mounts `App` inside React Strict Mode.
- `src/App.jsx` manages the authenticated session, selected tab, profile and finance state, monthly totals, savings streak, and entry modal. It also contains the web auth, savings, and settings views.
- `src/components/Dashboard.jsx` renders savings progress, the monthly budget and pipeline summaries, category distribution, the Buffett quote carousel, and dashboard quick actions.
- `src/components/PipelineScreen.jsx` renders the four spending stages, category filters, item actions, and edit modal. Each stage independently limits its default visible list based on viewport width and can expand into an internal scroll area.
- `src/components/AnalyticsScreen.jsx` aggregates confirmed spending by month and category and derives contextual insights.
- `src/lib/data.js` maps Supabase records to client state and handles saving profiles, deposits, and spending-item changes. Guest web data is stored in browser local storage.
- `src/lib/supabase.js` creates the browser Supabase client from Vite environment variables.
- `src/styles.css` defines the web visual system and responsive layouts.

### Mobile source overview

- `mobile/App.js` contains the Expo app root, Supabase session handling, data loading and writes, bottom-tab navigation, authentication, Home, Savings, Spending, Analytics, Settings, and shared entry/edit UI.
- `mobile/app.json` identifies the Finny app and declares Expo SDK 57.
- `mobile/package.json` pins the Expo, React, React Native, and SDK-managed module versions.
- `mobile/.env.example` lists the environment variables needed to connect the app to Supabase.

The mobile client uses AsyncStorage for persistent Supabase authentication and connects to the same `profiles`, `deposits`, and `spending_items` tables as the web client.

## Data model and privacy

The Supabase schema defines:

- `profiles`: one profile per authenticated user, including savings goal, monthly budget, currency, avatar, language, and reminder preference.
- `deposits`: savings amount, note, and deposit date.
- `spending_items`: item name, amount, category, note, date, purchase/completion dates, and stage (`wishlist`, `pending`, `ledger`, or `abandoned`).

The schema enables row-level security and restricts each user to their own records. Apply [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor when setting up a new database. Both apps use a **publishable** Supabase key in the client; never put a service-role key in either app.

## Run the web app

Requirements: Node.js and npm.

1. From the project root, install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable key:

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```

3. Apply `supabase/schema.sql` to the Supabase project if its tables and policies are not provisioned yet.
4. Start the Vite development server:

   ```sh
   npm run dev
   ```

For a production web bundle, run `npm run build`. To serve the generated bundle locally, run `npm run preview`.

## Run the mobile app

Expo SDK 57 targets React Native 0.86 and React 19.2.3. Use a compatible Node.js version (22.13 or later).

1. Open a terminal in `mobile/` and install dependencies:

   ```sh
   cd mobile
   npm install
   ```

2. Copy `mobile/.env.example` to `mobile/.env` and set the same Supabase URL and publishable key:

   ```text
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
   ```

3. Start Expo:

   ```sh
   npm start
   ```

Scan the development QR code with Expo Go, or run `npm run android` / `npm run ios` when a corresponding simulator or device setup is available. Expo inlines `EXPO_PUBLIC_` values into the client bundle, so only public client configuration belongs in these variables.

## Key workflows

1. Add a savings deposit or create a Wishlist item.
2. Move a Wishlist item to **To review**.
3. In **To review**, edit, cancel back to Wishlist, delete, or confirm the purchase.
4. A confirmed item enters **Purchase** and counts toward monthly analytics using its purchase date and category.
5. Confirm again to move it to **Let’s Go**. It remains part of confirmed expense totals; deleting a confirmed item removes it from those totals.

The web pipeline uses the responsive display limits from Version 1.7.0 of the specification: one visible item per stage at widths up to 428 px and two above that by default. The mobile pipeline uses the one-item default and expands each stage independently with internal scrolling.
