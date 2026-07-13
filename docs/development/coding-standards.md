# Coding standards

Follow the Developer Bible and root `AGENTS.md`. Prefer strong typing, clear ownership, reusable modules, accessibility, validation, secure defaults, and tests proportional to risk. Avoid duplicated logic, inline design values, hidden side effects, and premature abstractions.

Frontend work uses strict TypeScript and React Server Components by default. Add `"use client"` only for browser state or interactive APIs. Shared visual primitives belong in `packages/ui`; business components and route composition remain app-local. Use semantic elements, visible keyboard focus, reduced-motion support, and environment-based public configuration. Never expose a secret through a `NEXT_PUBLIC_` variable.

Run formatting, linting, type checks, and production builds from the workspace root before handoff. Do not suppress a rule or weaken strictness to make a check pass.
