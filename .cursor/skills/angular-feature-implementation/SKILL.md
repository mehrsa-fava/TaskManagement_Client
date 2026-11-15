---
name: angular-feature-implementation
description: Add one Angular screen or service in TaskManagement_Client using the existing folder, signal, and API mapper style. Use when implementing a component, form, route, or HTTP service.
---

# Angular feature

Read [docs/CLIENT_ARCHITECTURE.md](../../../docs/CLIENT_ARCHITECTURE.md) and [docs/API_CLIENT.md](../../../docs/API_CLIENT.md). Copy the nearest folder under `src/app`.

1. One folder: `name.ts`, `name.html`, `name.css`, and `name.spec.ts` when behavior changes. Class name matches the folder, as `TaskList` does.
2. Put HTTP in `src/app/services/`. Map wire types in a mapper. Keep view types in `src/app/model/`.
3. Add a route under `AppShell` only when the screen is reachable from the sidebar or a list. Project and sprint writes use `workspaceWriteGuard`.
4. Component state that is only for the open screen stays in the component. Shared lists stay on the service signal.
5. Forms send the same fields the API validator requires. Use `getApiErrorMessage` in the existing `error` signal.
6. Guard `localStorage` and `window` so SSR does not throw.
7. Run `ng test` for the new spec. Run `ng build` when templates or routes change.

Do not call GitLab, Figma, Canva, or an editor from the feature. Call `environment.api`.
