# Synera architecture

## Guiding rule

The product's rules and data contracts must not depend on React, browser storage, or a specific screen. The web client is one presentation adapter. A future Android client should consume the same domain concepts and versioned API contract.

## Layers

- **Domain** — entities, value types, and invariants. No UI or network dependencies.
- **Application** — use cases and repository ports. This is where validation and product rules live.
- **Infrastructure** — adapters such as the current local demo repository and a future HTTP client.
- **Presentation** — React components, navigation, styling, and interaction state.

## Current prototype

`DemoPlatformRepository` implements `PlatformRepository` and stores demo posts in browser local storage. It is deliberately replaceable. React calls `SocialUseCases`, not local storage directly.

The messaging screen currently uses page-session state and is only a visual interaction sample. It is not a secure messaging implementation.

## Android migration

When the product model stabilizes:

1. Keep the API resource names and DTO semantics in `src/domain/apiContracts.ts`.
2. Implement a server API and an HTTP adapter for the web client.
3. Define equivalent Kotlin data classes and repository interfaces in the Android project.
4. Put business validation and authorization on the server; client validation is only for usability.
5. Keep the Android UI independent from transport details using repository/use-case boundaries.

The TypeScript source is not intended to be mechanically translated into Kotlin. The goal is to preserve domain language, API contracts, and observable product behavior.
