# Suyziss Synera

**A calm, premium social space.**  
Version: `0.0.1-alpha`

Synera is an early web prototype for a social platform built around profiles, a thoughtful feed, conversations, and personal expression.

## Product direction

- Light appearance by default, with Light / Dark / System options.
- Responsive layouts for desktop and mobile.
- Feed, Explore, Messages, Notifications, and Profile surfaces.
- Demonstration interactions backed by local browser storage.
- Domain models and application ports kept separate from React so the product rules can later be reused by an Android client.

## Architecture

```text
src/
  domain/           # Platform entities and value types
  application/      # Use-case contracts and repository ports
  infrastructure/   # Demo/local implementation of those ports
  App.tsx           # Web presentation and interaction layer
  styles.css        # Design system and responsive styling
```

The current implementation is a frontend prototype. It does not provide real accounts, server persistence, secure messaging, or multi-device synchronization. Local demo data is not a production backend.

## Run locally

Requirements: Node.js 20+

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — type-check and build the production bundle
- `npm run preview` — preview the production bundle

## Versioning

This repository starts at **0.0.1-alpha**. The alpha label means features, interfaces, and contracts may change.

## Roadmap

1. Refine the responsive visual prototype and interaction details.
2. Stabilize domain models and API contracts.
3. Add a backend, authentication, moderation, and secure messaging.
4. Build the native Android client against the same platform contracts.

## License

No license has been selected yet. All rights are reserved by default until a license is added.
