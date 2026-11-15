# Client architecture

`TaskManagerApp` is the Angular client for the TaskManagement API. It does not own business rules. The API at `environment.api` (`https://localhost:7168/api` in development) authorizes every call.

## Layout

| Path | Role |
|---|---|
| `src/app/layout/app-shell.*` | Authenticated shell |
| `src/app/project-sidebar/` | Project navigation |
| `src/app/<feature>/` | One folder per screen: `*.ts`, `*.html`, `*.css`, optional `*.spec.ts` |
| `src/app/services/` | HTTP and view state. `providedIn: 'root'` |
| `src/app/model/` | View models and API DTO types |
| `src/app/guards/` | `authGuard`, `workspaceWriteGuard` |
| `src/app/interceptors/auth.interceptor.ts` | Attaches the access token |
| `src/app/utils/` | API errors, Jalali dates, sprint helpers |
| `src/environments/` | `api` base URL |

New screens follow that shape. Do not introduce `features/core/shared` folders, NgModules, or a global store library while signals on the existing services are enough.

## Routing

Public routes: `login`, `register`. Everything else is a child of `AppShell` and uses `authGuard`. Project and sprint create/edit also use `workspaceWriteGuard`.

An Employee can open tasks. `AuthService.canManageWorkspace` is false for the Employee role, so project and sprint forms stay hidden and the guard redirects. The API still enforces Admin on those writes.

## State

Services hold `signal` state and expose readonly signals plus `loading` and `error`. Components read those signals. A component keeps only local UI state, such as which field is being edited.

## SSR

The app hydrates on the client. `localStorage` is already guarded in `AuthService`. New browser-only calls need the same guard so the server render does not throw.

## Tests

Specs sit next to the file and run with `ng test` (Vitest). Cover a service mapping and the main screen interaction that the change adds.

## Commands

```bash
ng serve
ng build
ng test
```

## Out of scope here

GitLab, Figma, Canva, and editor tokens. Those stay on the API. This client only calls TaskManagement endpoints. Do not add a Node API beside `src/server.ts`.
