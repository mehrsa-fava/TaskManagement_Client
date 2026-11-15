# API client

Call the TaskManagement API through a service. Components do not use `HttpClient` directly.

## Base URL and auth

- Base URL: `environment.api`.
- `authInterceptor` adds the bearer token from `AuthService.getToken()`.
- Login and register use `{ statusCode, message, result }`. `result.roles` is a string array. Known roles are `Admin` and `Employee`.
- The session is `AuthService`. Do not add a second user or token store.

## Task calls

`TaskService` maps API rows in `task-api.mappers.ts`.

- View type: `Task` in `src/app/model/task.ts`.
- Wire types: `src/app/model/task-api.ts`.
- List: `GET /Task/GetAllTasks` and `GET /Task/GetAllTasksByProjectId`.
- Create and update go through `toCreateDto` and `toUpdateDto`.

Keep new request fields in the API type and the mapper together. A field that exists only on `Task` will not be saved.

## Status values

`TaskStatus` in the client includes `Completed`. The API enum stores `Complete`, not `Completed`. Before sending a status, match the string the API persists. Do not add a third spelling.

Priority values are `Low`, `Medium`, `High`, `Urgent`. Time estimate and time tracked, when shown, are integer hours.

## Errors

Use `getApiErrorMessage`. A 401 means the session is missing or expired. A 403 means the user is signed in but is not allowed. Show that as permission denied, not as an empty list.

## Dates

Display with `formatGregorianAsShamsi` or `persian-date-input`. Do not format due dates with a second calendar library.

## Later API fields

Display keys, comments, development activity, and documents appear in the UI only after a mapper reads them from the API. Do not invent those objects in the client.
