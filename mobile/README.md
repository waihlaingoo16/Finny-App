# Finny mobile

Expo / React Native companion app for the Finny web client.

## Run locally

1. Install Node.js LTS, then run `npm install` from this directory.
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the same Supabase project used by the web app. The publishable key is embedded in the client bundle; never put a service-role key here.
3. Run `npm start` and scan the QR code with Expo Go, or select an installed Android/iOS simulator.

The mobile client uses the existing `profiles`, `deposits`, and `spending_items` tables and their row-level security policies. If credentials are not configured, the app displays setup guidance instead of a blank screen.
