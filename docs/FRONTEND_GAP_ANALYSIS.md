# Frontend gap analysis

**Status:** Analysis only. Not approved for implementation.  
**Sources:** This Angular repo, every file in `docs/design/`, `docs/PRODUCT_REQUIREMENTS.md`, and the backend documents `API_CONTRACTS.md` and `PERMISSION_MATRIX.md` in `d:\Clean Code\Source\TaskManagement\docs\`.

Those two backend documents are marked **proposed and not approved**. This gap list treats an endpoint as existing only when the contract says the controller already has it.

`docs/FRONTEND_ARCHITECTURE.md` is not in this repo. `docs/CLIENT_ARCHITECTURE.md`, `docs/FRONTEND_UX.md`, and `docs/API_CLIENT.md` were used instead.

## 1. Existing functionality

### 1.1 Stack

- Angular 21.1, standalone components, signals, Tailwind CSS 4, SSR.
- No PrimeNG.
- Dates: Jalali display and `persian-date-input`. API values stay the strings the API already accepts.
- Session: `AuthService`, bearer interceptor, refresh on 401, `authGuard`, `workspaceWriteGuard`.
- Roles the client understands: `Admin` and `Employee`. An employee cannot open project or sprint forms. The API still enforces Admin on those writes.

### 1.2 Screens that work against the current API

| Area | What the client does | API |
|---|---|---|
| Login, register, refresh | Forms and session | Account envelope |
| Projects | List, create, update, delete | `Project/*` |
| Sprints | List, create, update, delete, sidebar tree | `Sprint/*` |
| Tasks | List by project, get, create, update, delete | `Task/*` |
| Board | `GetBoardByProjectId`, drag and keyboard to change status | Board DTO and `ChangeTasksStatus` |
| Move between sprint and backlog | `MoveTasks` exists on the service | `MoveTasks` |
| Tags | List and get-or-create | `Tag/*`. Uniqueness is per project on the server |
| Assignees | Multi-select on the task | `userIds` on create and update |
| Attachments | Upload, download, delete | 20 MB `UploadTaskFile` and the download and delete actions |
| Workload report | Bars, pies, sprint charts, time-by-person | `GetProjectWorkload` plus tasks already loaded for the charts the workload DTO does not contain |
| Bulk | Select rows and change status | `ChangeTasksStatus` only |

### 1.3 Partial task detail

`TaskForm` already shows status, assignees, due date, priority, time estimate, time tracked, sprint points, tags, description, a related-task picker, file attach, and an activity pane.

- Related tasks are stored in the legacy `relatedTasks` string. There is no link type.
- Comments are one activity string appended through `UpdateTaskById`. They are not a thread, and they have no reactions or replies.
- `Add subtask` creates another task and stores its id in `relatedTasks`. It is not a parent-child checklist or a subtask entity.
- `Create checklist` and `Add fields` are disabled.
- The tag field placeholder is `Search or add tags...`. The requirement asks for `select or add...`.
- Tag color can be chosen for a new tag. There is no recolor call. The API ignores color when the normalized name already exists.

### 1.4 Filters

The list and board can filter by tag and assignee in the client. The list also has All / Active / Completed, which is local and means `Done` versus not `Done`.

The API list and board accept `tagIds` and `userIds` as OR filters, plus `sprintId` or `backlog`. They do not accept status, priority, or title. The client tag and assignee toggles currently require every selected value (AND). That does not match the API.

## 2. Missing functionality

| Product requirement | In the UI | In the API today | Proposed API |
|---|---|---|---|
| Folders | No | No | `api/Folder`, flat, approval required |
| Documents and editor | No | No | `api/Document`. Editor provider not chosen |
| Task link types | String list only | `relatedTasks` string | `GetTaskLinks`, `CreateTaskLink`, `DeleteTaskLink`. Types not approved |
| Checklists | Disabled button | No | Checklist and item commands. No item assignee or due date |
| Comment reactions and replies | Activity log only | `activity` string | `GetTaskComments`, create, react. Edit and delete not specified |
| Bulk move, delete, tag, assign, priority | Status only | Move and status only | `BulkUpdateTasks`. Not built |
| Tag recolor | Color only at create | No | `PUT Tag/UpdateTagColor` |
| Status, priority, and title filters | No | No | Extra query params on the existing list and board |
| Central search | No | No | `GET Search/Query` |
| Project chat, rooms, direct messages, SignalR | No | No hub | `api/Chat` and `/hubs/chat` |
| Read ticks, 15-minute edit, voice, sticker, file, image | No | No | In the chat contract. Several rules pending |
| Pivot | Fixed charts, not a pivot | Workload only | `POST Report/GetPivot` |
| Email on assign and status | No client work. The server sends it | `IEmailSender` is registered and unused | No public send endpoint. Correct |

## 3. Components that need modification

| Component | Change, after approval | Why |
|---|---|---|
| `ProjectSidebar` | Folder and document nodes. Chat entry. Sprint row states closer to the screenshot (green, current, not started) | The tree is the navigation reference. Do not add Spaces |
| `TaskList` | Group labels already match status. Add title search and status and priority filters when the API accepts them. Extend the bulk bar. Show empty and 403 without clearing the error | Filters and bulk are required. The Design screenshot does not show checkboxes. Bulk select needs an explicit yes |
| `TaskBoard` | Inline composer already takes a title. The screenshot also shows assignee, dates, priority, and tag on that composer | Optional fields. The current emit is title and status only |
| `TaskForm` | Placeholder text, checklist slot, comment thread, link types, overlay versus page | The detail screenshot is the reference. Do not enable checklist against the activity string |
| `SprintForm` | Optional dialog presentation. Drop template, settings, and learn-more unless approved | Those controls are in the screenshot and have no API |
| `ProjectReports` | Keep the workload cards. Add a pivot only when `GetPivot` exists. Do not add a timesheet week grid on integer hours | Several report images need data the API does not have |
| `TaskUserService` | Stop depending on Admin-only `GetAllUsers` for members | Employees cannot load assignees |
| `TagService` | `UpdateTagColor` when that action exists. Placeholder `select or add...` | Requirement section 9 |
| `TaskService` | Send `statuses`, `priorities`, and `title` when the API accepts them. Point bulk at `BulkUpdateTasks` when it exists. Folder id on move when folders exist | Do not invent the query names |
| `AuthService` | Read a project-manager flag only if login starts returning it | The flag does not exist |

`ProjectList` is unused by the router. Leave it unused.

## 4. New components

Needed only when the matching API is approved. Details are in `FRONTEND_COMPONENT_ARCHITECTURE.md`.

- Folder service and sidebar nodes.
- Document list, document route, editor host.
- Checklist block inside `TaskForm`.
- Comment thread inside the activity pane.
- Task-link list replacing the string picker.
- Bulk bar actions beyond status.
- Shell search.
- Chat channel list, transcript, composer, SignalR connection.
- Pivot view inside reports.

Not needed for the product text, visible only as ClickUp chrome: Integrate, Ask, Share, SyncUp, Follow, Whiteboard, Reminder, Gantt, Calendar, Timeline, Table, Team, Me mode, templates, custom fields, AI command palette.

## 5. Missing designs

| Need | What was supplied |
|---|---|
| Login and register | Nothing. Keep the current pages |
| Project create and edit | Nothing. Keep the current form |
| Central search results | A search box inside ClickUp chrome only |
| Bulk selection and confirm | Nothing |
| Empty, loading, error, permission denied | Nothing. Keep text lines |
| Filter menu contents | Filter icons, not the open menu |
| `+ Task` chevron menu | The chevron, not the menu |
| Calendar, Gantt, Timeline, Table, Team | Tabs only |
| Spreadsheet editor | A word-style document only |
| Document sharing screen | A button labeled Sharing and Permissions |
| Chat ticks, voice, sticker, file, group thread | A direct thread with one incoming text message |
| Mobile layout | Nothing |
| Dark theme | Nothing |
| Pivot builder (field wells, drag measures) | Fixed dashboard cards |

Duplicate files, so they are one screen each:

- `sprints/backlog view.PNG` and `tasks/backlog view.PNG`.
- `sprints/board view.PNG` and `tasks/board view backlog.PNG` (the image is a sprint board).

`sprints/list view.PNG` and the report samples use other workspaces. They specify patterns, not this product's statuses or people.

## 6. API dependencies

The client must not call a route that is only in section 2 of `API_CONTRACTS.md` until that route is implemented and the contract is approved.

| UI work | Blocked on |
|---|---|
| Assignee list for an employee | A member list the employee is allowed to call. `GetAllUsers` is Admin-only |
| Status, priority, title filters | New query params on `GetAllTasksByProjectId` and `GetBoardByProjectId` |
| Folder tree and folder task list | `api/Folder` and `folderId` on list, board, and move |
| Nested folders (`Phases` / `test`) | A parent field. The proposal is flat |
| Checklist | Checklist commands and `checklists` on `GetTaskById` |
| Comment reactions and replies | Comment endpoints. Edit and delete are unspecified |
| Link types | `Task/GetTaskLinks` and an approved type set. Legacy string stays until then |
| Tag recolor | `PUT Tag/UpdateTagColor` |
| Bulk move, delete, tag, assign, priority | `PUT Task/BulkUpdateTasks`. Move and status can ship earlier on the endpoints that already exist |
| Documents | `api/Document`, file storage, and an editor decision (`TECHNICAL_DECISIONS.md` in the backend repo) |
| Search | `GET api/Search/Query` |
| Chat | `api/Chat`, `/hubs/chat`, file rules, and the pending room permission |
| Pivot | `POST api/Report/GetPivot` |
| Burndown, burnup, cycle time, daily timesheet, HH:MM:SS | Not in the workload DTO or the pivot catalog. A new contract, not a client calculation on incomplete history |
| Email | No client endpoint. Do not add one |

Existing calls the UI can keep using now: Account, Project, Sprint, Task CRUD, files, MoveTasks, ChangeTasksStatus, Tag get-or-create, GetBoard, GetProjectWorkload.

Known contract mismatches to preserve, not paper over:

- Task status `Completed` in the client is `Complete` on the API. The mapper already converts it.
- `CreateNewProject` and `CreateNewSprint` return HTTP 200 with `success: false` on validation failure.
- `GetSprintById` returns HTTP 200 and an empty DTO when the sprint is missing.
- `GetAllUsers` is Admin-only.
- File download is `application/octet-stream`.
- Lists are unbounded. Paging the task list would be a breaking change and is out of the proposed filter slice.

## 7. Screenshot versus product versus API

| Screenshot | Product text | Proposed API | Decision |
|---|---|---|---|
| Spaces, `New Space`, many view tabs | Extend the current shell. No second tree | Projects, folders, sprints | Which chrome is in scope |
| Nested `Phases` / `test` | Nesting unspecified | Flat folder | Nest or not |
| Documents under the project tree | A documents area. Scope unspecified | Project-scoped, optional `taskId` | Sidebar node versus a separate area |
| Doc menu: favorite, move, duplicate, archive, wiki, template, sharing | Editor and permissions unspecified | Title, type, download, delete | Which menu items exist |
| Checklist item assignee | Item assignment unspecified | Not on the DTO | Build the icon or not |
| Create sprint template and `{INDEX}` rule | Not required | Title, dates, goal | Keep the current form fields |
| All Channels with Follow, and a channel per list | One project group, admin rooms, direct chats | `GetMyChannels`, `CreateProjectRoom` | Do not build the Follow directory |
| Create Channel private toggle and Add a List | Room membership pending | Name only. Recommended: every member | Private rooms or not |
| Time sheet hours and minutes, 8-hour day | Not specified | Integer hours | Do not fake minutes |
| Dashboard Add Card | Pivot grid | One `GetPivot` response | Cards versus a grid |
| Gregorian dates in the screenshots | Shamsi in `FRONTEND_UX.md` | API date strings | Which calendar each field shows |
| Purple primary | Current primary is indigo `#4f46e5` | None | Recolor or keep indigo |
| Task detail as an overlay | Current route is a page | None | Overlay or page |
| Bulk checkboxes | Required | `BulkUpdateTasks` | The Design list does not show them |

## 8. Unresolved UI decisions

These need an answer before the related screen is built.

1. Navigation scope. Current sidebar plus the required nodes, or the ClickUp tree including Spaces and the extra view tabs.
2. Primary color. Indigo in the app, or the purple in the screenshots.
3. Task create and edit. Keep `/task/form`, or open the screenshot panel over the list.
4. Sprint create. Keep the page, or use the dialog and ignore template, settings, and learn-more.
5. Folder nesting. The screenshot shows one child level. The API proposal is flat.
6. What `+ Add item` under a folder creates.
7. Document menu items beyond rename and delete.
8. Spreadsheet UI. No grid screenshot was supplied, and the editor product is not chosen.
9. Checklist item assignee icon.
10. Comment edit and delete. No endpoint until the permission decision.
11. Task relation types.
12. Whether bulk select is added to the list even though the Design screenshot has no checkboxes.
13. Filter combination. API is OR inside a dimension and AND across dimensions. The current chips are AND inside a dimension.
14. Saved filters. Proposal says query parameters only.
15. Search box placement and the result row. No screen.
16. Chat entry point, and whether the All Channels page is in or out.
17. Who sees Create Channel. Depends on the project-manager decision.
18. Group read ticks. The rule is pending.
19. Direct chat after users no longer share a project.
20. Which report cards are in scope. Workload and assignee counts can be done. Burndown, cycle time, and the weekly timesheet cannot, on the current contract.
21. Pivot library, if the pivot is in the first reporting slice.
22. Date calendar. Shamsi in the app, Gregorian in the screenshots, and a document title that already contains a Jalali-looking date (`1405/06/22`).
23. Responsive behavior. Not specified by the images. The sidebar does not collapse today.
24. Empty, error, and confirm visuals. Not specified. `window.confirm` is the current delete confirm.
25. `GetAllUsers` for employees. The assignee control cannot work for them until a member endpoint exists.

## 9. What must not be removed

These work and are not replaced by a screenshot:

- Login, register, and refresh.
- Admin-only project and sprint forms, including the employee redirect.
- Shamsi date input, until decision 22 changes it.
- Task status mapping, including `Complete` versus `Completed`.
- Attachment upload and download.
- The activity log, until the comment API is the replacement.
- The workload report, which the pivot does not replace.
- Sidebar delete confirms for project and sprint.
- Tests next to services and screens. New behavior needs a spec. This analysis does not add tests.
