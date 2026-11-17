# Frontend implementation plan

**Status:** Proposed sequence. No application code in this phase.  
**Rule:** A phase starts only after the decisions it lists are approved, and only after the API it calls exists. Proposed endpoints in `API_CONTRACTS.md` are not a reason to call them.

Do not implement a whole phase in one change. Each phase is a set of small slices. Each slice names the screen, the service, the contract, and the tests before the files change. `docs/AGENT_WORKFLOW.md` stays the working rule.

The order below is by dependency. Phases 1 and 2 can proceed on the API that exists today. Later phases wait.

## Phase 0 — Decisions

No UI code.

Approve or reject the items in `FRONTEND_GAP_ANALYSIS.md` section 8, in particular:

- Navigation scope (current shell versus the extra ClickUp tabs).
- Page versus dialog for task and sprint create.
- Folder nesting.
- Which document menu items exist.
- Which report cards exist beyond workload.
- Purple versus the current indigo.
- Shamsi versus the Gregorian labels in the screenshots.
- How an employee loads project members. This is a backend change. The client cannot fix `GetAllUsers`.

Until Phase 0 answers the navigation question, no sidebar redesign starts.

## Phase 1 — List and board on the current API

**Depends on:** Phase 0 navigation and color decisions. No new endpoint.

**Already built:** Grouped list, board, drag, keyboard status, tag and assignee chips, inline title on the board, task open on `/task/form/:id`.

**Slices, each optional until you ask for it:**

1. Align status pills and column order with the screenshot order that matches `TaskStatus`: Open, Pending, In Progress, Completed, In Review, Accepted. Rejected, Blocked, and Closed stay because they are real enum values even when a crop cuts them off.
2. Board inline create: add assignee, due date, priority, and tag only if you want the composer in `add new task in board.PNG`. The service already accepts those fields on create.
3. List inline create row, matching `add new task in list view.PNG`, still calling `CreateNewTask`.
4. Sprint sidebar state icon from dates the client already has (not started, in progress, completed). The pink count stays the open-task count already computed for completed sprints, and only if you confirm that meaning.
5. Empty, loading, and error text on list and board, including a 403 that does not look like an empty sprint.

**Out of this phase:** Calendar, Gantt, Timeline, Table, Team, Channel, `+ View`, Integrate, Ask, Share, templates, `/` commands, AI.

**Tests:** `task-list.spec.ts`, `task-board.spec.ts`, mapper specs if a request field changes.

**API:** `GetAllTasksByProjectId`, `GetBoardByProjectId`, `CreateNewTask`, `ChangeTasksStatus`.

## Phase 2 — Task detail on the current API

**Depends on:** Phase 0 choice of page versus overlay. No new endpoint.

**Slices:**

1. If the overlay is approved, present `TaskForm` over the list without a second form component. If not, keep the route and do not imitate the close icon.
2. Change the tag placeholder to `select or add...`. Keep get-or-create. Show the color returned by the server when a duplicate is reused.
3. Attachment failure text. Upload already exists.
4. Keep related tasks on the `relatedTasks` string. Do not add link-type labels.
5. Keep the activity pane as a log. Do not label it as reactions or replies.

**Out of this phase:** Checklists, comment reactions, custom fields, subtask tree, track-time start button as a timer. `Track time` in the screenshot is not the integer `timeTracked` field. A timer needs a contract.

**Tests:** `task-form.spec.ts`.

**API:** `GetTaskById`, `UpdateTaskById`, `UploadTaskFile`, `DownloadTaskFile`, `DeleteTaskFile`, `GetOrCreateTag`.

## Phase 3 — Filters and the bulk actions that exist today

**Depends on:** A yes for checkboxes, because the Design list screenshot does not show them. The product requirements do require bulk actions.

**Can start before new filter parameters:**

- Bulk move, using `MoveTasks`, to a sprint or to backlog.
- The status action already calls `ChangeTasksStatus`.
- Confirm before any future delete. Do not add delete until `BulkUpdateTasks` or an explicit multi-delete rule exists. Calling `DeleteTaskById` in a loop is a behavior change and needs a yes.

**Waits on the API:**

- Query params `statuses`, `priorities`, and `title` on list and board.
- When those exist, the filter chips switch to the API rule: OR inside assignee, status, and tag, AND across those groups. Title is contains. Document the change from the current AND chips in the slice notes.
- Filters stay on the request. They are not saved.

**Tests:** `task-service.spec.ts` for the new params, and a list interaction spec.

## Phase 4 — Tags, links, checklists, comments, full bulk

**Depends on:** The matching section of `API_CONTRACTS.md` being implemented, and the pending permission rows.

| Slice | Endpoint | UI |
|---|---|---|
| Recolor | `PUT Tag/UpdateTagColor` | Color control on an existing tag |
| Links | `GetTaskLinks`, `CreateTaskLink`, `DeleteTaskLink` | Replace the string picker only after types are approved. Stop writing `relatedTasks` in that same slice |
| Checklists | Checklist commands, included on `GetTaskById` | Enable the disabled button. No item assignee |
| Comments | `GetTaskComments`, `CreateTaskComment`, `ReactToTaskComment` | Thread in the activity pane. Hide edit and delete |
| Bulk | `PUT Task/BulkUpdateTasks` | One mutation per call. Confirm delete. Max 100 ids |

Do not send `folderId` on bulk move until Phase 5.

**Tests:** Service spec per endpoint, one component spec for checklist toggle and one for bulk confirm.

## Phase 5 — Folders

**Depends on:** Nesting decision. If the answer is flat, the sidebar shows a single level even though `sub folder view.PNG` shows `Phases` / `test`. If the answer is nested, the API needs a parent id first. The client does not fake a parent in the browser.

**API:** `GetAllFoldersByProjectId`, `CreateFolder`, `UpdateFolderById`, `DeleteFolderById`, `folderId` on list, board, and move.

**UI:** Folder nodes in `ProjectSidebar`. The folder screen reuses `TaskList` and `TaskBoard`. Delete is blocked with the API's 400 when the folder still has tasks. Say that in the error line.

**Permission default in the proposal:** any project member may manage folders. Hide or show the create control from that rule once it is approved. The server still checks.

## Phase 6 — Documents

**Depends on:** Editor product, file storage, and which menu items from `options for document.PNG` are in scope. Rename and delete are the only ones in the proposed contract.

**API:** `GetProjectDocuments`, `CreateDocument`, `GetDocumentById`, `UpdateDocumentTitle`, `DeleteDocumentById`, `DownloadDocument`, `GetEditorConfig`.

**UI:** A Documents node. A list of titles. An editor host that uses the signed config and does not see the secret. Loading and save failure on that page. No spreadsheet grid until a spreadsheet screenshot and a provider that supports it are both approved.

**Search:** Document titles become searchable only in Phase 8.

## Phase 7 — Chat

**Depends on:** Room-create permission, whether a room contains every member, group tick semantics, and direct-chat behavior after a shared project ends. The proposal says not to build `CreateProjectRoom` until the first two are decided. The automatic project group can be specified before that.

**Do not build** the All Channels Follow directory or the Create Channel toggles for private and "add a list". Those are not in the contract.

**API and hub:** `GetMyChannels`, `GetChannelMessages`, `SearchProjectMembers`, `GetOrCreateDirectChannel`, `SendMessage`, `EditMessage`, `MarkChannelRead`, `DownloadMessageFile`, hub `/hubs/chat`.

**UI order:**

1. Channel list for the current project, including the automatic group.
2. History, then SignalR `JoinChannel`. Reconnect loads from the last id.
3. Text send with `idempotencyKey`.
4. Edit control visible only for the sender and only inside 15 minutes. The server still rejects a late edit.
5. Ticks from `receipt`, after the seen-by-all rule is approved.
6. File, image, voice, and sticker after `FILE_STORAGE_SPECIFICATION.md` is the approved limit.
7. Create room button only for the approved principal.

**Out of this phase:** SyncUp, calendar card, bookmarks, AI in the composer, Follow.

**Client library:** SignalR client. It is not in `package.json` today. Adding it is part of this phase, not an earlier one.

## Phase 8 — Search

**Depends on:** A result-row design, because none was supplied. Projects and tasks can be searched before documents exist. Documents join the same box after Phase 6.

**API:** `GET api/Search/Query` with `term`, optional `types`, `page`, `pageSize`.

**UI:** One box on `AppShell`. Results show type, title, and project. Opening a row uses the existing project, task, or document route. A 403 never appears as a hit. Empty term is not sent.

## Phase 9 — Reports

**Depends on:** Which cards you want, and a pivot library if the grid is in scope.

**Can be done with the current workload endpoint, as `ProjectReports` already does:** status counts, active and finished totals, time tracked by person in hours, assignee task counts from the loaded tasks.

**Needs `POST Report/GetPivot`:** a configurable grid over the published field catalog (`status`, `priority`, `assignee`, `sprint`, `tag`, `taskType`, `project`, `dueMonth`, `createdMonth`) and measures `taskCount`, `timeEstimateHours`, `timeTrackedHours`, `sprintPoints`. One fan-out dimension only.

**Needs a new backend contract, so they are not scheduled here:** sprint burndown and burnup with guideline and non-working days, cycle time, a per-day timesheet, `HH:MM:SS`, an 8-hour capacity tooltip, dashboard Add Card, and export. The download icon in `tasks by each person.PNG` stays out until an export format is approved. The reporting specification leaves CSV and Excel pending.

**UI:** Add the pivot beside the existing workload cards. Do not remove `GetProjectWorkload`.

## Phase 10 — Not scheduled

These stay out until a requirement and a design exist:

- Email preferences. There is no client screen and no first-slice endpoint.
- Notification quiet hours.
- Dark theme.
- A collapsed sidebar. `FRONTEND_UX.md` mentions it. The CSS does not implement it, and no screenshot shows it.
- PrimeNG.
- Display keys such as `OPS-42`. The API contract explicitly does not add them.
- Real-time task events on `/hubs/projects`. Optional, and not required for the chat acceptance list.

## Dependency overview

```text
Phase 0 decisions
    |
    +-- Phase 1 list and board (current API)
    +-- Phase 2 task detail (current API)
    |
    +-- Phase 3 filters and existing bulk
    |       |
    |       +-- Phase 4 links, checklists, comments, full bulk, tag color
    |
    +-- Phase 5 folders (after nesting decision and Folder API)
    |
    +-- Phase 6 documents (after editor decision)
    |       |
    |       +-- Phase 8 search (tasks and projects can start earlier)
    |
    +-- Phase 7 chat (after room permission)
    |
    +-- Phase 9 pivot (after GetPivot; workload cards already exist)
```

Phases 1 and 2 are independent of each other. Phase 5 is independent of Phase 4 except where bulk move gains `folderId`. Phase 7 is independent of documents. Phase 9 is independent of chat.

## Verification for every slice that changes UI

- `ng test` for the spec that was added or changed.
- `ng build` when a template or route changes.
- Browser pass: sign in, open a project, exercise the slice, and repeat as an employee when the control is a project, sprint, folder, or chat-room create.
- Do not declare a visual change done from a single screenshot of the page.

## What this plan does not do

- It does not modify `src/`.
- It does not add packages.
- It does not change the backend.
- It does not treat `PERMISSION_MATRIX.md` as an approved role model. Project manager is still pending.
