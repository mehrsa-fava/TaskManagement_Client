# Frontend UX

ClickUp is the interaction reference. Do not copy its logo, icons, or brand assets. This app already has its own shell. Extend that shell. Do not add a second navigation tree for Spaces, Folders, or Lists.

## Stack

- Angular 21, standalone components, signals, Tailwind CSS 4.
- Dates use `persian-date-input` and `src/app/utils/jalali-date.util.ts`. Show Shamsi dates. Send the API the value it already expects.
- There is no PrimeNG dependency. Build controls with Tailwind and the existing components.

## Shell

`AppShell` wraps authenticated routes and renders `ProjectSidebar`.

- Home is `project/list` (`WorkspaceHome`).
- A project opens its backlog at `project/:projectId/backlog`.
- A sprint opens at `project/:projectId/sprint/:sprintId`.
- Project and sprint forms are Admin paths. `workspaceWriteGuard` sends an Employee back to a task list.
- Task create and edit stay on `task/form` and `task/form/:id`.

Add search, a create action, or a task drawer inside this shell. List, Board, Calendar, and Timeline, when added, are views over the same `Task` rows. Board columns are `TaskStatus` values. Dragging calls the existing task update. Keyboard users can change status without dragging.

## Screens that already exist

Login, register, project list, project sidebar, project form, sprint form, task list, task form, profile menu.

## Task surface

Title, status, priority, assignees, description, project, and sprint. Show comments, links, attachments, and development activity only after the API returns those fields. Do not store them only in the browser.

## States

Every new screen has loading, empty, error, and permission-denied states. Use `getApiErrorMessage`. Do not show a raw HTTP body.

## Responsive

The sidebar collapses on a narrow viewport. Task lists stay usable without horizontal scrolling of the whole page. Color is not the only signal for status or priority.
