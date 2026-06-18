# Repository Guidelines

## Project Idea

This project is for an existing offline shop that sells tractors, tractor spare parts, and car spare parts. The new website should display the shop's products to customers and support two paths when someone wants a product:

- The customer can contact the shop directly for questions, quotes, or availability checks.
- The customer can use the website to place an order, pay, and buy online.

## Project Structure & Module Organization

This is a Node.js 20+ Express API written in TypeScript and emitted to `dist/`.
Source lives in `src/`:

- `src/app.ts` configures Express middleware, routes, and error handling.
- `src/server.ts` starts the HTTP server and runtime services.
- `src/config/` contains environment and logger setup.
- `src/DB/` contains database connection code and models.
- `src/middlewares/` contains reusable Express middleware.
- `src/modules/<feature>/` contains feature routes, controllers, services, validators, and types, for example `auth` and `user`.
- `src/shared/` contains cross-module utilities, jobs, integrations, response helpers, and shared types.

Tests are not currently present. When adding them, colocate as `*.test.ts` or `*.spec.ts`; these patterns are already excluded from production builds.

## Build, Test, and Development Commands

Use pnpm; the lockfile is `pnpm-lock.yaml`.

- `pnpm install` installs dependencies.
- `pnpm dev` runs TypeScript checking in watch mode and starts `src/server.ts` with `tsx`.
- `pnpm build` compiles TypeScript to `dist/`.
- `pnpm start` runs the compiled app from `dist/server.js`.
- `pnpm lint` runs `tsc --noEmit` for type-checking.
- `pnpm test` is currently a placeholder and exits with an error.

## Coding Style & Naming Conventions

Use ES modules and strict TypeScript. Keep imports compatible with `moduleResolution: "NodeNext"`. Prefer explicit exported types for shared contracts and Zod schemas for request validation. Follow the existing feature naming style: `auth.controller.ts`, `auth.service.ts`, `auth.route.ts`, `auth.validators.ts`, and `auth.types.ts`.

Use clear service/controller separation: controllers handle HTTP concerns, services contain business logic, and routes wire middleware to controllers.

## Testing Guidelines

No test framework is configured yet. For new tests, choose a Node-compatible TypeScript runner and add a real `pnpm test` script. Name tests `*.test.ts` or `*.spec.ts`. Prioritize route/service coverage for authentication, authorization, validation, payment integrations, and error paths.

## Commit & Pull Request Guidelines

Git history was not available in this workspace, so no project-specific commit convention could be inferred. Use concise, imperative commit messages such as `Add user profile validation` or `Fix auth token expiry handling`.

Pull requests should include a short summary, affected routes/modules, required environment changes, and verification steps. Include screenshots or sample API responses when changing externally visible behavior.

## Security & Configuration Tips

Keep secrets in `.env` and do not commit local credentials. Review integrations in `src/shared/utils/` before changing payment, email, storage, or token behavior, and document any new environment variables in the README.
