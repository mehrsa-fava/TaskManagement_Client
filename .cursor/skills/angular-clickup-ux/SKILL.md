---
name: angular-clickup-ux
description: Extend the TaskManagement Angular shell, sidebar, task list, and views with Tailwind. Use when the user mentions the workspace shell, sidebar, list, board, task drawer, navigation, or ClickUp-style layout.
---

# Angular workspace UX

Read [docs/FRONTEND_UX.md](../../../docs/FRONTEND_UX.md) and [docs/CLIENT_ARCHITECTURE.md](../../../docs/CLIENT_ARCHITECTURE.md).

1. Keep `AppShell` and `ProjectSidebar`. Hierarchy on screen is Project, then backlog or sprint, then Task.
2. Angular 21 standalone components and signals. Style with Tailwind 4. Do not add PrimeNG.
3. List, Board, Calendar, and Timeline read `TaskService`. Board columns are `TaskStatus`. A status change calls the existing update method.
4. Dates go through `persian-date-input` or `jalali-date.util.ts`.
5. Loading, empty, error, and permission-denied states. A keyboard path for status changes.
6. Hide project and sprint create/edit when `AuthService.canManageWorkspace()` is false. Leave `workspaceWriteGuard` on those routes.
7. Do not copy ClickUp logos or icons.

Verify in the browser: open a project, change a task, refresh, and confirm an Employee cannot open the project form.
