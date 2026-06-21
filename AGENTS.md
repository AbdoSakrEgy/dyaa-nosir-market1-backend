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

Use ES modules and strict TypeScript. Keep imports compatible with `moduleResolution: "NodeNext"`. Prefer explicit exported types for shared contracts and Zod schemas for request validation. Do not use `.extend(` in any `*.validators.ts` file; define shared field schemas as reusable constants and build each `z.object(...)` directly. Follow the existing feature naming style: `auth.controller.ts`, `auth.service.ts`, `auth.route.ts`, `auth.validators.ts`, and `auth.types.ts`.

Use clear service/controller separation: controllers handle HTTP concerns, services contain business logic, and routes wire middleware to controllers.

Name every API route after the controller/service method it invokes, converting the method name from camelCase to kebab-case. For example, `profileController.getMe.bind(profileController)` must use `/get-me`, not `/me`, and `profileController.getAll.bind(profileController)` must use `/get-all`. Keep the controller and service operation names aligned.

Route paths must remain distinct and descriptive even when different HTTP methods would technically allow the same path. If two operations would otherwise share a path such as `/product` (for example, one `POST` and one `PATCH`), give the operations suitable distinct method names and matching paths, such as `/list-products`, `/product-details`, `/create-product`, or `/update-product`.

Keep `src/modules/**` service classes focused on API-facing service operations. Any helper function used by a module `*.service.ts` file that is not itself an API service method must live in that module's `utils/` folder, for example `src/modules/auth/utils/create-session.ts`, `normalize-phone.ts`, and `verify-google-token.ts`. This rule applies to `src/modules/**`, not shared integration utilities outside the modules folder.

For every API service method that retrieves a collection using pagination, limits, filters, sorting, search, or similar query options, write the query-building logic directly inside that service method (for example, `async listProfiles(query: ListProfilesQueryDTO)`). Do not extract this logic into a separate helper function or a file in the module's `utils/` folder.

Keep pagination and filtering consistent with `ProfileService.listProfiles`: start a `// step: build allow-listed filters` block by calculating `page` and `limit`, create a typed Mongoose `FilterQuery<ModelType>`, and then apply only validated query fields. Next, retrieve the records and `totalItems` together with `Promise.all`, applying sorting, `skip`, `limit`, and `lean` directly to the query. Return the collection plus `meta` containing `totalItems`, `itemCount`, `itemsPerPage`, `totalPages`, and `currentPage`. Follow this structure for all new collection APIs.

In every `*.controller.ts` class, add a method-name banner comment directly above each method:

```ts
// ---------------------------- methodName ----------------------------
async methodName() {
  // ...
}
```

In every `*.service.ts` class, add a method-name banner comment directly above each method:

```ts
// ============================ methodName ============================
async methodName() {
  // ...
}
```

In every `*.validators.ts` file, add a schema-name banner comment directly above each schema:

```ts
// ============================ registerSchema ============================
export const registerSchema = z.object({
  // ...
});
```

For service methods, keep business-flow comments in the existing style. Each logical code block inside a `*.service.ts` method should start with a short `// step: ...` or `// sub-step: ...` comment.

## Testing Guidelines

No test framework is configured yet. For new tests, choose a Node-compatible TypeScript runner and add a real `pnpm test` script. Name tests `*.test.ts` or `*.spec.ts`. Prioritize route/service coverage for authentication, authorization, validation, payment integrations, and error paths.

## Commit & Pull Request Guidelines

Git history was not available in this workspace, so no project-specific commit convention could be inferred. Use concise, imperative commit messages such as `Add user profile validation` or `Fix auth token expiry handling`.

Pull requests should include a short summary, affected routes/modules, required environment changes, and verification steps. Include screenshots or sample API responses when changing externally visible behavior.

## Security & Configuration Tips

Keep secrets in `.env` and do not commit local credentials. Review integrations in `src/shared/utils/` before changing payment, email, storage, or token behavior, and document any new environment variables in the README.

The application supports exactly two roles: `customer` and `admin`. Protect every admin-only API with `authorize("admin")`, and do not introduce any additional roles.
