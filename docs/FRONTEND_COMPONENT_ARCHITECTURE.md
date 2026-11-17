# Frontend component architecture

**Status:** Analysis only. Not approved for implementation.  
**Rule:** New UI stays inside the current Angular shape from `docs/CLIENT_ARCHITECTURE.md`: one folder per screen, services with signals, no NgModules, no second global store, no PrimeNG.

This document names components that already exist and components the screenshots need. It does not add files.

## 1. Application shape today

Angular 21. Standalone components. Signals on services. Tailwind CSS 4. SSR with client hydration. Vitest via `ng test`.

There is no PrimeNG dependency and no PrimeNG theme. `docs/FRONTEND_UX.md` forbids adding one.

```
src/app/
  layout/app-shell          Authenticated frame
  project-sidebar/          Project and sprint tree
  workspace-home/           Empty home
  project-list/             Not routed. Superseded by the sidebar
  project-form/             Create and edit project
  sprint-form/              Create and edit sprint
  task-list/                List, and host for board and reports
  task-board/               Board columns
  task-form/                Create and edit task
  project-reports/          Charts from the workload report and in-memory tasks
  profile-menu/             Current user
  login/  register/
  persian-date-input/
  guards/  interceptors/  services/  model/  utils/
```

Routes are in `src/app/app.routes.ts`. Public: `login`, `register`. Everything else is a child of `AppShell` behind `authGuard`. Project and sprint forms also use `workspaceWriteGuard`.

State lives on the service (`projects`, `tasks`, `loading`, `error`). Components keep local UI state (which cell is being edited, which panel is open).

## 2. Existing components

| Component | Responsibility now | Keep |
|---|---|---|
| `AppShell` | Sidebar plus router outlet | Yes. Do not add a second shell |
| `ProjectSidebar` | Projects, reports link, backlog link, sprint tree, create and delete for non-employees, profile menu | Yes. Extend for folders, documents, and chat only after those APIs and the navigation decision are approved |
| `ProfileMenu` | Current user and logout | Yes |
| `WorkspaceHome` | Directs an employee to the first project backlog. Tells an admin to pick a project | Yes |
| `ProjectForm` | Title and member ids. Admin path | Yes. No screenshot. Do not restyle it in the visual pass |
| `SprintForm` | Title, Shamsi dates, goal. Full page | Yes until the create-sprint dialog is approved as a replacement |
| `TaskList` | Grouped list, tag and assignee filters, inline edit, bulk status, hosts board and reports | Yes. This is the list surface |
| `TaskBoard` | Columns, drag and keyboard status change, inline title add | Yes. This is the board surface |
| `TaskForm` | Full-page task fields, tags, attachments, activity string, related-task ids, subtask-as-new-task | Yes. Checklist button stays disabled until the checklist API exists |
| `ProjectReports` | Workload bars and pie, assignee pie, sprint estimate charts, burnup and burndown from tasks already loaded, time table | Yes. Do not replace it with a dashboard builder |
| `Login`, `Register` | Account forms | Yes. No screenshot |
| `PersianDateInput` | Shamsi date entry | Yes. Use it wherever a date is edited |

`ProjectList` still exists and is not on a route. Do not revive it as a second project browser.

## 3. Existing services

| Service | Owns | HTTP it calls today |
|---|---|---|
| `AuthService` | User, token, roles, `canManageWorkspace` | None. Session is `localStorage` key `taskmanager_user` |
| `UserService` | Login, register, refresh | `Account/login`, `account/register`, `Account/refresh-token` |
| `ProjectService` | Project list and CRUD | `Project/*` |
| `SprintService` | Sprints by project | `Sprint/*` |
| `TaskService` | Tasks, board, move, status, files | `Task/*` |
| `TaskUserService` | Assignee directory | `POST Task/GetAllUsers` |
| `TagService` | Tags by project, get-or-create | `Tag/*` |
| `ReportService` | One project workload | `GET Report/GetProjectWorkload` |

`authInterceptor` attaches the bearer token and refreshes once on 401. `getApiErrorMessage` is the only user-facing error parser.

Do not call `HttpClient` from a component. A new screen gets a service in `src/app/services/` and models in `src/app/model/`.

## 4. What should stay local to a screen

| State | Where it belongs |
|---|---|
| Expanded project or folder | `ProjectSidebar` signals, as today |
| Selected view tab | Query `view`, as today |
| Open popover, inline edit cell | The screen that owns the cell |
| Dialog open and draft | The screen that opened the dialog |
| Pivot configuration, if the pivot is approved | `ReportService` or the reports screen. Not a new store |
| Chat draft and scroll position | The chat screen |
| Access token | `AuthService` only |

## 5. Reusable pieces to extract only when a second screen needs them

The screenshots repeat visuals that are currently copied as Tailwind or private CSS. Extract a component when a second caller exists. Do not create a `shared/` folder of unused widgets.

| Piece | Used by today | Also needed by |
|---|---|---|
| Avatar initials | `avatar.util.ts` plus markup in list, form, reports | Board already uses the util. Chat and documents will too |
| Tag chip | List, form, board | Keep the util `tagColorClass`. One chip component when chat or documents also show tags |
| Status pill | List, board, form | Same util. One pill component if the markup diverges |
| User picker popover | Task form and list cell | Bulk assign, filters |
| Tag picker | Task form. Placeholder is `Search or add tags...` | Product text requires `select or add...`. One picker, used by the form, the list, and bulk add-tag |
| Confirm dialog | `window.confirm` in the sidebar | Bulk delete, document delete, sprint delete |
| Dialog shell | None. Forms are pages | Create sprint, create task, create channel, only if those stop being pages |
| Empty, loading, and error text | Each screen has its own paragraph | Keep the text pattern. A wrapper is optional and not required by a screenshot |
| Report card frame | `ProjectReports` only | New report cards should use the same card, not a second chart library layout |

## 6. Screens that need new components

These are not created yet. Each waits on the API and the approval named in the gap analysis.

### 6.1 Folder tree nodes

**Host:** `ProjectSidebar`.  
**Responsibility:** Render a folder, expand it, and route to a task list filtered by that folder.  
**Does not:** Invent nesting if the approved API is flat.  
**Service:** a `FolderService` with the same signal shape as `SprintService`.

### 6.2 Document list and editor host

**Host:** a new route under the project, linked from the sidebar.  
**Responsibility:** List document titles, open one, rename, delete. The editor itself is the approved self-hosted component. This app supplies the shell, the title, and the save and error text.  
**Service:** `DocumentService`. It must not receive the editor secret. `GetEditorConfig` returns a signed config. The component passes that config to the editor and does not log it.

### 6.3 Checklist block

**Host:** `TaskForm`, in the disabled `Create checklist` slot.  
**Responsibility:** Show checklists from `GetTaskById`, add a titled list, add an item, toggle `isComplete`.  
**Does not:** Assign an item to a user or set an item due date. Those controls are in the screenshot and are absent from the proposed DTO.

### 6.4 Comment thread

**Host:** the activity pane on `TaskForm`.  
**Responsibility:** Page through `GetTaskComments`, post a body, reply with `parentCommentId`, toggle a reaction.  
**Does not:** Edit or delete a comment until that endpoint is approved. The current activity textarea writes `activityComment` on task update. That is a log line, not this thread. Keep the log until the comment API replaces it, and do not show both as if they were one list.

### 6.5 Task link list

**Host:** the existing related-items panel on `TaskForm`.  
**Responsibility:** Call `GetTaskLinks`, `CreateTaskLink`, `DeleteTaskLink` once link types are approved.  
**Today:** Related tasks are a comma-separated string on the task. Keep that until the link API is the approved source. Do not write both.

### 6.6 Bulk bar

**Host:** `TaskList`.  
**Responsibility:** Show the selected count. One action at a time, matching `BulkUpdateTasks`: move, status, priority, add tag, assign, delete. Delete asks for confirmation.  
**Today:** Only status is wired, through `ChangeTasksStatus`. Extend that bar. Do not add a second selection model on the board until a board screenshot shows selection.

### 6.7 Filter bar

**Host:** `TaskList` and `TaskBoard`.  
**Responsibility:** Assignee, status, tags, title, priority. Send them as query parameters. Do not save the filter until saved views are approved.  
**Today:** Tag and assignee toggles exist, and they require every selected id (AND). The API matches any id (OR). The bar must use the API rule once status, priority, and title filters exist. Until then, do not silently change the current AND behavior without calling it out in the change.

### 6.8 Central search

**Host:** `AppShell`, because it spans projects.  
**Responsibility:** One query box, `GET Search/Query`, results grouped by type, open the project, task, or document.  
**Missing design:** No results panel was supplied. The box position and the result row need approval before this is built.

### 6.9 Chat

**Host:** a new route, entered from the project.  
**Pieces:**

| Piece | Responsibility |
|---|---|
| Channel list | `GetMyChannels` for the project. Not the Follow directory in the screenshot |
| Transcript | `GetChannelMessages` with `beforeId`. Append `message.created` |
| Composer | Text first. File, image, voice, and sticker only with the file-storage rules |
| Receipt ticks | Render `receipt.sent` and `receipt.seenByAll` after the group-read rule is approved |
| Direct start | `SearchProjectMembers` then `GetOrCreateDirectChannel` |
| Connection | `@microsoft/signalr` or the equivalent client. Join after the REST history load. On reconnect, reload from the last id, then `JoinChannel` |

Chat does not go through the task hub. The proposed project hub is optional and is not required for chat.

### 6.10 Pivot grid

**Host:** `ProjectReports`, as another card or a dedicated view on the same route.  
**Responsibility:** Send `rowFields`, `columnFields`, `measures`, and `filters` to `POST Report/GetPivot`. Render the returned cells. Refuse a request the catalog rejects (`assignee` and `tag` together, unknown field).  
**Does not:** Become the ClickUp dashboard with Add Card, drag, and auto-refresh. Those interactions have no approved contract.  
**Library:** Not chosen. The reporting specification leaves the grid control to the client. Choosing a library is an approval item.

## 7. Routing to add only with the feature

Keep current paths. Suggested additions, not implemented:

| Path | Screen | Guard |
|---|---|---|
| `project/:projectId/folder/:folderId` | Same `TaskList`, folder scope | `authGuard` |
| `project/:projectId/documents` | Document list | `authGuard` |
| `project/:projectId/documents/:documentId` | Editor | `authGuard` |
| `project/:projectId/chat` | Channel list | `authGuard` |
| `project/:projectId/chat/:channelId` | Transcript | `authGuard` |
| Search | Query on the shell, or `search` | `authGuard` |

Task create and edit stay on `task/form` and `task/form/:id` until an overlay is approved. An overlay would still use `TaskForm`. It would not be a second form.

Employee users never see project or sprint create. Folder create, if members are allowed, is not behind `workspaceWriteGuard`. Chat room create is hidden unless the approved principal matches the user. Hiding is not the security check.

## 8. Authorization in the UI

| UI | Condition in the client today | Server rule |
|---|---|---|
| New, edit, delete project | `canManageWorkspace` (not Employee) | Admin |
| New, edit, delete sprint | same | Admin |
| Task create and edit | Any signed-in user who can open the project | Project member or Admin |
| Assignee directory | Loaded for every task screen | `GetAllUsers` is Admin-only |

The last row is a defect to fix with the API, not with a new client role. An employee who opens assignees today receives 403, and the picker is empty. A member-list endpoint does not exist. Do not call `GetAllUsers` as a workaround for employees, and do not cache another user's directory in `localStorage`.

`canManageWorkspace` is "not Employee". A future project-manager flag is not a role the client can read. Do not add a manager check until login returns that flag.

## 9. Error, loading, and empty

Every new screen follows the current pattern:

- `loading` signal, one line of text.
- `error` signal, `getApiErrorMessage`, never the raw body.
- 403 is permission denied, not an empty list.
- 401 goes through the interceptor. If refresh fails, the session is cleared.
- Empty copy is a sentence. No illustration was designed.

Uploads, bulk delete, chat send, and document save need an explicit failure line on that surface. The task file upload already returns null on failure and the form must show the message. Confirm that when the form is next changed.

## 10. What not to introduce

- PrimeNG, or a second component library, unless a later approval names one for the pivot or the document editor.
- NgModules, `features/core/shared`, or NgRx.
- A Node API beside `src/server.ts`.
- ClickUp brand icons, the word ClickUp, Brain, SyncUp, or Integrate.
- Mock rows for documents, chat, or pivot. `docs/PRODUCT_REQUIREMENTS.md` forbids mock data as a stand-in for the API.
- A client-side tag uniqueness check as the only check. The server already normalizes and returns the existing tag.
