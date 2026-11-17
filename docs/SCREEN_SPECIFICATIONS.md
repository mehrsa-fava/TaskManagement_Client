# Screen specifications

**Status:** Analysis only. Not approved for implementation.  
**Source:** Every file in `docs/design/`. Nothing here is a new layout.

Interactions are listed only when the screenshot shows the control or the result of a click. Where a control is visible and its result is not, the behavior is marked **not shown**.

Two pairs of files show the same pixels:

- `docs/design/sprints/backlog view.PNG` and `docs/design/tasks/backlog view.PNG` are the Design list.
- `docs/design/sprints/board view.PNG` and `docs/design/tasks/board view backlog.PNG` are the Sprint 12 board. The task file name says backlog. The breadcrumb says Sprint 12.

`docs/design/sprints/list view.PNG` is a different workspace (`Work / Product / Content Development`) on a purple desktop. It is a list-pattern reference, not a screen of Hidden Object or Jahangir.

Report images `report 1` through `report 5`, `report sample view`, the time cards, and `tasks by each person` use sample names (Bryce, Eric C., Leslie, Harrison, Daniel). They are dashboard patterns. They are not this product's data.

Login, register, project create, project edit, and central search results have no screenshot.

## 1. Sidebar — projects

**File:** `docs/design/projects/projects view in side bar.PNG`

**Purpose:** Switch project and open a list, sprint group, or document group inside the expanded project.

**Layout:** A narrow vertical tree. No main canvas is in the crop.

**Hierarchy:**

1. Project header: orange `H` tile, `Hidden Object`, lock, `+`.
2. `Backlogs` row with chevron, `...`, `+`.
3. Indented lists: `Design` (selected, count 9), `Develope & Server` (3), `Art` (11), `Test` (9). Each has a small colored icon.
4. `Sprints`, `Documents`, `Project Lessons & Knowledge Base`.
5. `Quality Control Checklist` with a checkmark icon and count 2.
6. Collapsed projects: `Jahangir` (`J`), `Coin Quest` (`C`), `Backgammon` (`B`), each with a lock.
7. `+ New Space`.

**Reusable pieces:** Project row, letter tile, lock, tree chevron, count badge, add button.

**Interactions visible:** `Design` is the selected child, so selecting a list highlights it. Chevrons imply expand and collapse. `+`, `...`, the lock, and `New Space` have no opened result in this image.

**Data:** Project name, icon letter and color, lock state, child name, child icon, child count, expanded flag.

**States not shown:** Loading, empty project, error, what the lock means, what `+` creates, what `...` contains.

## 2. Sidebar — sprint folder

**File:** `docs/design/sprints/sprint view.PNG`

**Purpose:** List sprints for one project and start another sprint.

**Layout:** Same narrow tree. Project `Jahangir` (`J`), lock, `+`. Then `Sprint Folder`. Then fourteen sprint rows. Then `+ Create Sprint`.

**Row contents:** State icon, label `Sprint N (date - date)`, optional pink count. Sprint 13 uses a blue partial circle and a gray count `14`. Sprint 14 uses a gray dashed circle, is highlighted, and has no pink badge. Earlier sprints use a green circle. Pink counts visible: 12, 12, 1, 2, 2, 2, 2, 6, 18.

**Interactions visible:** Sprint 14 is selected. `+ Create Sprint` is the entry to the create dialog. The meaning of the pink number is not labeled. Edit and delete are not on the row.

**Data:** Sprint name, date range, state, optional count.

**States not shown:** No sprints, loading, failed create, a sprint the user cannot open.

## 3. Create sprint dialog

**File:** `docs/design/sprints/create new sprint.PNG`

**Purpose:** Name a sprint, choose its dates, and record a goal.

**Layout:** Centered white dialog.

**Fields, top to bottom:**

| Field | Shown value |
|---|---|
| Title | `Create Sprint`, close `×` |
| Sprint name | `Sprint 15 (11/30 - 12/6)` |
| Helper | `Must include {INDEX} – a sequential number for each Sprint starting with 1` |
| Use template | `Select a template...` |
| Helper link | `Sprint settings` |
| Sprint duration | `Default (1 week)` selected, `Custom` not selected |
| Start date | `2026-11-30` |
| End date | `2026-12-06` |
| Sprint goal | Placeholder about what the team wants to accomplish |
| Footer | `Learn more about Sprints`, `Cancel`, purple `Create` |

**Interactions visible:** One duration radio is selected. `Custom` is present and not selected. Whether `Custom` unlocks the date fields is not shown. Template options are not shown. `Sprint settings` and `Learn more` destinations are not shown.

**Data the current API can store:** title, start date, end date, goal, project id. Templates, sprint settings, and the `{INDEX}` naming rule are not API fields.

**States not shown:** Validation when the name has no index, end before start, submit failure, employee without permission.

## 4. List — Design backlog

**Files:** `docs/design/sprints/backlog view.PNG`, `docs/design/tasks/backlog view.PNG`

**Purpose:** Tasks in the `Design` list, grouped by status.

**Layout:**

1. Breadcrumb: `Hidden Object` with lock, `Backlogs`, `Design` dropdown, then star, filter, people, and calendar icons whose actions are not shown.
2. Right: phone, Integrate, Ask, Share, Manage.
3. View tabs: Channel, List (underlined), Board, Calendar, Gantt, Timeline, Table, a second Calendar, a second List, `+ View`.
4. Sub toolbar: `Status` pill, columns, filter, closed-eye, assignee, search, gear, purple `+ Task` with chevron, and a circled plus at the far right of the column header.
5. Table columns: Name, Assignee, Due date, Priority.
6. Group `BLOCKED` with count 3, expanded.
7. Group `OPEN` with count 6, expanded.

**Rows in BLOCKED:**

| Name | Tags | Assignee | Due | Priority |
|---|---|---|---|---|
| Miniqame 5 Arts_Mr Tabara | none | empty person | empty calendar | empty flag |
| UI figma + VFS_Mr Davoodi | none | empty person | `2025-03-25` in red | empty flag |
| Dialogs system in Decoration | `decoration`, `document` | `NK` | empty calendar | empty flag |

**Rows in OPEN:** Summary of each character (`launch`), Events Doc (`economy`, `launch`), Change game system based on users feedback (`launch`), Adding social features (`launch`), Design part2 of whole game (`launch`), Chance in Economy (`launch`). Assignees are `NK` or empty. Dates and flags are empty.

**Interactions visible:** Groups have chevrons, so they collapse. List is the selected view. Tags, avatars, and the red date are display only in this crop. No row is open. No checkbox is visible, so bulk select is not established by this screen.

**Data:** Task title, status group, tags, assignee initials, due date, priority flag, group count.

**States not shown:** Loading, no tasks, error, a collapsed group, filter applied, search with no hits.

## 5. List — marketing reference

**File:** `docs/design/sprints/list view.PNG`

**Purpose:** A second list pattern. Use it for controls that the Design crop does not show. Do not treat its workspace, statuses, or people as this product.

**Extra controls that are visible here and not in the Design crop:**

- Left app rail: Home, Inbox, Docs, Dashboards, Whiteboards, Spaces.
- Toolbar: Search, Hide, Customize, `Add Task`.
- Chips: Group by Status, Subtasks collapse, Columns, Filters, Me mode, Assignees, Show closed, Hide, `Search tasks...`.
- Group header includes `+ Add Task`.
- Status groups shown: TO DO, IN PROGRESS, REVIEW, UPDATE REQUIRED. A lower group is cut off.
- Rows show assignee photos or initials, due text (`Apr 26`, `Tomorrow`), and priority words (`High`, `Normal`).
- A row can show a subtask count and a tag (`phase 2`).

**Not in the product requirements:** Home, Inbox, Whiteboards, Me mode, Show closed, subtasks as a tree, status names TO DO / REVIEW / UPDATE REQUIRED / Normal priority.

**States not shown:** Same as section 4.

## 6. Board — sprint

**Files:** `docs/design/sprints/board view.PNG`, `docs/design/tasks/board view backlog.PNG`

**Purpose:** Tasks of one sprint in status columns.

**Layout:**

1. Breadcrumb: `Jahangir`, `Sprint Folder`, `Sprint 12 (11/9 - 11/15)` dropdown, then `Done`, `Nov 9-15`, `0 pts`, `18 not est`.
2. View tabs: Add Channel, List, Board (selected), Team, Calendar, Gantt, Sprint Reporting, `+ View`.
3. Pale pink banner: `This sprint has 18 unfinished tasks`.
4. Columns left to right: OPEN 4, PENDING 0, IN PROGRESS 2, COMPLETED 12, IN REVIEW 0, ACCEPTED (count cut off). Further columns are off-screen.
5. Purple `+ Task` at the top right.

**Cards that are readable:**

| Column | Cards |
|---|---|
| OPEN | Import Profile UI, Import Login UI, Customized Character, Customized Beads. Avatars `MB` or `ME`. Tags include `ui` and `client` |
| PENDING | Empty. `+ Add Task` |
| IN PROGRESS | Implementing Power Cards (`3/5`, tags `cards`, `lv/progression`), Power Cards System (tag `client`). `+ Add Task` |
| COMPLETED | Prototype of Power Cards (`16 of 18`, tag `design`), Login flow UX (`design`), Assign base power cards to each card, Level Progression on XP, Matchmaking document, Leaderboard overview (cut off). Several show a red avatar |
| IN REVIEW | Empty. `+ Add Task` |
| ACCEPTED | Empty in the crop. `+ Add Task` |

**Interactions visible:** Board tab is selected. Empty columns still offer `+ Add Task`. Horizontal overflow is visible. Dragging a card is not shown. Opening a card is not shown.

**Data:** Sprint name and dates, done flag, points, not-estimated count, unfinished count, status, task title, assignees, tags, and a progress fraction whose source is not labeled.

**States not shown:** Loading, sprint with no tasks, drag preview, permission denied, banner dismissed.

## 7. Add task — button and modal

**File:** `docs/design/tasks/add new task button.PNG`

**Purpose:** Create a task without leaving the current location.

**Layout:** White panel. Tabs: Task (selected, purple underline), Doc, Reminder, Whiteboard, Dashboard. Close icon.

**Task tab:**

- Location dropdown `Sprint 12 (11/9 - 11/15)`.
- Type dropdown `Task`.
- Title placeholder `Task Name or type '/' for commands`.
- Description placeholder `Add description, or write with AI`.
- Chips: `OPEN`, Assignee, Due date, Priority, Tags, `...`.
- `Fields` and `+ Create new field`.
- Footer: `Templates`, attachment icon, bell with `1`, `Create Task` with chevron.

**Interactions visible:** Task is the selected tab. The other tabs are not opened. The chevron on `Create Task` implies more create actions. Those actions are not shown. `/` commands and AI writing are visible and are not product requirements.

**Data:** Location (sprint or list), task type, title, description, status, assignee, due date, priority, tags, watcher count `1`.

**States not shown:** Empty title error, create failure, Doc tab, the overflow menu.

## 8. Add task — inline on the board

**File:** `docs/design/tasks/add new task in board.PNG`

**Purpose:** Create a task inside a column. A red circle in the image marks the composer. The circle is an annotation on the screenshot, not part of the UI.

**Composer contents:** `Task Name...`, purple `Save`, then rows `Add assignee`, `Add dates`, `Add priority`, `Add tag`, then `+ Add Task` under the composer. It sits in the IN PROGRESS column.

**Interactions visible:** Save is the commit control. Whether Enter saves, and whether the extra rows expand pickers, is not shown.

**Data:** Title plus optional assignee, dates, priority, and tag. Status is the column.

## 9. Add task — inline on the list

**File:** `docs/design/tasks/add new task in list view.PNG`

**Purpose:** Create a task as a new row in a status group.

**Layout:** Group `OPEN` with count 4. Four existing rows (Import Profile UI, Import Login UI, Customized Character, Customized Beads) with teal `ME` avatars, tags `ui` or `client`, empty dates and flags. The new row has the placeholder `Task Name or type '/' for commands`, a set of small icons, `Cancel`, and purple `Save`. Under the row, each column shows the word `Calculate`.

**Interactions visible:** Cancel and Save are the two labeled actions. The icon buttons in the new row are not labeled. `Calculate` has no visible result.

**Data:** Title at minimum. The icons suggest assignee, date, priority, and tag, but the crop does not name them.

## 10. Task detail

**File:** `docs/design/tasks/edit task view.PNG`

**Purpose:** Read and edit one task.

**Layout:**

1. Top bar: back chevron, `J` avatar, breadcrumb, sprint crumb `Sprint 12 (11...`, `+`, refresh, Share, Connect, link, `...`, close.
2. Title `Customized Beads`.
3. A dismissible banner: Ask Brain for a presentation, document, or prototype. This is ClickUp chrome.
4. Property rows: Status `OPEN` with a menu and a check, Assignees `ME` plus `majid esfanani`, Dates `Start → Due`, Priority `Empty`, Time estimate `Empty`, Sprint points `Empty`, Track time with a `Start` button, Tags `client` and `ui`.
5. Description placeholder with AI.
6. Actions: Add fields, Add subtask, Relate items or add dependencies, Create checklist, Attach file.
7. Right rail of icons. The icons are not labeled in the crop. One is a comment-style bubble.

**Interactions visible:** Status has a dropdown. The check control is visible. Track time has `Start`. The banner can be closed. Share, Connect, and the right-rail icons have no opened panel in this image.

**Data:** Title, status, assignees (name and initials), start, due, priority, time estimate, sprint points, timer state, tags, description, and the five action rows.

**States not shown:** Save confirmation, validation, a running timer, a failed upload, activity history.

The current app already has a full-page form for these fields, plus an activity pane. The screenshot is a drawer or overlay (close icon, back chevron) rather than a separate route. Whether edit stays on `/task/form/:id` or becomes an overlay is an open decision.

## 11. Checklist inside the task

**File:** `docs/design/tasks/check list view.PNG`

**Purpose:** Checklists on a task.

**Layout:** Title `Implementing Power Cards` with a pink status dot. Assignees `M` and `ME`. Track time `Start`. Tags `cards` and `lv/progression`. Description placeholder. The same action list as the detail view. Then `Checklists` with `2 open` and a short progress bar. One card titled `Cards Name`.

**Items:** Dessert (checked), Speed (checked), Opium (open), Freeze (open), Mirror (checked). Each row has an assignee placeholder on the right. Footer: `+ Add item` and an assignee placeholder. Below the card: `Hide completed` and `+ Add checklist`. Attach file remains under the checklist.

**Interactions visible:** A checkmark toggles an item. `Hide completed` is a control. Its collapsed result is not shown. Add item and Add checklist are controls. Their forms are not shown. Item assignee icons are visible and empty.

**Data:** Checklist title, item text, complete flag, open count, and an optional item assignee. The proposed checklist API has title, text, `isComplete`, and `sortOrder`. It does not have item assignees. That icon needs a decision before it is built.

**States not shown:** No checklists, all items complete, delete checklist, reorder.

## 12. Folders

**Files:** `docs/design/folders/folder view.PNG`, `docs/design/folders/sub folder view.PNG`

**Purpose:** Show folders in the project tree. The first image circles `Phases` and `Documents`. The circle is an annotation.

**Collapsed:** Under `Jahangir` and `Sprint Folder`: folder `Phases`, folder `Documents`, list `Backlog` with count 20, list `Design Backlog`.

**Expanded:** `Phases` is open and contains folder `test`, then `+ Add item`, then list `Phase 1(06/15)`.

**Interactions visible:** A folder expands. `+ Add item` is visible only under the expanded child in this crop. What it creates (folder, list, or task) is not shown. `...` and `+` on the project row are visible in the expanded crop.

**Data:** Folder name, nested folder name, list name, list count.

**Conflict to resolve:** The product text says nesting is unspecified. The proposed API is a flat folder. This screenshot shows one level of nesting (`Phases` contains `test`).

## 13. Documents — sidebar

**File:** `docs/design/documents/document sidebar view.PNG`

**Purpose:** Documents live in the project tree under `Documents`.

**Rows:** `Release 3: 1405/06/29`, `MVP 2: 1405/06/22`, `Seed Validation`, `Onboarding on 1405/08/05`. Each has a blue document icon. `Backlog` (20) and `Design Backlog` sit below the folder.

**Interactions visible:** The folder is expanded. Selecting a document is not shown. Creating a document is not shown.

**Data:** Document title. No type icon difference between a document and a spreadsheet is visible. All four icons match.

## 14. Document editor

**File:** `docs/design/documents/writing in documents view.PNG`

**Purpose:** Read and write a document.

**Layout:**

- Toolbar: `Link Task or Doc`, `Mark Wiki` (purple), `Add icon`, `Add cover`, `Settings`.
- Title: `MVP 2: 1405/06/22`.
- Byline: avatar, `Mehrsa Amini`, `Last updated 2026-09-13 at 17:16`.
- Body is rich text: paragraphs, a numbered list, red colored phrases (`Connect Totally`, `Complete`), and rounded highlight chips (`done` on green, `Not done` on orange).

**Interactions visible:** The toolbar buttons are present. Their panels are not open. The body shows color and highlight, so the editor supports inline formatting. The formatting toolbar itself is not in the crop.

**Data:** Title, author name, last updated timestamp, document body.

**Not established:** Spreadsheet grid, cursors of other editors, version history, import, export, save indicator, comment marks.

## 15. Document settings menu

**File:** `docs/design/documents/options for document.PNG`

**Purpose:** Actions on one document.

**Items:** Rename, Copy link, Favorite (submenu chevron), Move to (submenu), Duplicate, Archive, Delete. Separator. Save as template. Mark Doc as wiki, toggle off. Purple `Sharing and Permissions`.

**Interactions visible:** Favorite and Move to have submenus. Those submenus are not open. The wiki toggle is off. Sharing and Permissions is a button. Its screen is not shown.

**API overlap:** Rename and delete are in the proposed document contract. Copy link, favorite, move, duplicate, archive, template, wiki, and a sharing screen are not.

## 16. Chat — conversation

**File:** `docs/design/chat/chat view.PNG`

**Purpose:** A direct conversation.

**Layout:**

- Header: avatar, `Bamdad Bastani`, `...`, star. Right: phone, Ask, Show profile.
- Tabs: Chat (selected), Calendar, Tasks, `+ View`.
- A collapsed bar: `Add bookmarks, notes, and more`.
- A vertical icon rail on the right (search, and other icons that are not labeled).
- Empty-state block: `Chat with Bamdad Bastani`, `This conversation started on September 6, 2026.`, `View Profile`, a pink `View Calendar` card, a green `Start SyncUp` card.
- Date chip: `Sunday, September 6th`.
- One incoming message: avatar `BB`, name `Bamdad Bastani`, time `11:50`, Persian text on two lines.
- Composer: placeholder `Write to Bamdad Bastani, press 'space' for AI, '/' for commands`, a row of small icons, microphone, and a send button with a chevron.

**Interactions visible:** Chat is the selected tab. The message is left-aligned, so it is the other person. Ticks are not visible on this message. The composer icons are not labeled, so voice, sticker, file, and image cannot be assigned to specific icons from this crop.

**Not in the product requirements, visible here:** Calendar tab, Tasks tab, bookmarks, View Profile, View Calendar, SyncUp, Ask, AI space shortcut.

**Data:** Other person's name and avatar, conversation start date, message author, time, body.

**States not shown:** Sending, failed send, unread, ticks, an outgoing bubble, a group thread, reconnect, edit-within-15-minutes.

## 17. Chat — all channels

**File:** `docs/design/chat/all chat rooms.PNG`

**Purpose:** A directory of channels.

**Layout:** Title `All Channels`. Purple `Create Channel`. Search `Search for Channels`. Columns: Channels and Spaces, Topic, Followers, Last updated.

**Rows visible:** Hidden Object (Following, 5 followers, `2 years ago`), Coin Quest (Follow, 1), Backlogs in Hidden Object (1), Sprints (2), Develope & Server in Backlogs (0), Art (0), Design (1), then Sprint 2, 3, 4, 5, and Sprint 12 with 0 followers. Topic cells are empty. Several rows have a lock.

**Interactions visible:** `Follow` and `Following` are two states of one control. Search and Create Channel are present. Opening a row is not shown.

**Conflict:** The product chat model is one automatic project group, extra rooms created by an admin or manager, and private conversations. This screen lists lists and sprints as channels and uses Follow. That model is not in the proposed `api/Chat` contract. Do not implement Follow or a channel-per-list until it is approved.

## 18. Chat — create channel

**File:** `docs/design/chat/add new chat room.PNG`

**Purpose:** Name a new channel.

**Fields:** Title `Create Channel`, short description, required `Name` with placeholder `e.g. Ideas` and a purple focus ring, `Make Private` toggle (off) with the caption `Only you and invited members have access`, `Add a List` toggle (off) with the caption `Attach a List to manage tasks and work`, `Import`, purple `Create`.

**Interactions visible:** Toggles are off. Their on state and the member picker are not shown.

**API overlap:** Proposed `CreateProjectRoom` sends `projectId` and `name` only. Private membership and attaching a list are not in that contract. Permission to create is still pending in `PERMISSION_MATRIX.md`.

## 19. Reports — dashboard samples

These images are card layouts. They are not one screen of this product. People, statuses, and numbers are sample data.

### 19.1 `report 1.PNG`

Tabs Board, List, Dashboard (selected), `+ View`. Actions Hide, Customize, `Add Card`. A welcome card titled `Welcome to ClickUp Dashboards`. Cards: Unassigned `0 tasks`, a card showing `5` `tasks in progress` with `Refreshed just now`, Completed `3 tasks completed`. A `Tasks Complete...` card lists Bryce, Eric C., and Leslie with colored counts. A pie `Total Tasks by Assignee` is partly visible (Bryce 18.18%, Eric C. 36.36%). A bar chart `Open Tasks by Assignee` is partly visible.

### 19.2 `report 2.PNG`

Two cards. Pie of total tasks: Bryce 18.18%, Leslie 18.18%, Daniel 18.18%, Eric C. 36.36%, Harrison 9.09%. Bar chart `Open Tasks by Assignee`: Eric C. 3, Harrison 1, Daniel 1, Leslie 2, Bryce 1.

### 19.3 `report 3.PNG`

`Workload by Status` as one horizontal stacked bar, 0 to 100. A tooltip on the red segment reads `REVIEW: 22.22% (2)`. Below it, `Tasks Due This Week or Overdue` is a task list grouped by Tomorrow, with the same list chrome as section 5 (Group, Subtasks, Columns, Filters, Show closed, search, Customize).

### 19.4 `report 4.PNG`

The same due list, scrolled to show group Tomorrow (2) and group Done (1). Rows: `New integration rebuild` (Normal, Tomorrow), `Home Page Refresh` (Tomorrow), `Website Illustration` (High, Today, tag `phase 2`). Each group has `+ Add Task`.

### 19.5 `report 5.PNG`

Three cards: pie `Workload by Status` (TO DO, IN PROGRESS, REVIEW, UPDATE REQUIRED, READY FOR..., CLOSED), stacked bar `Priority Breakdown` (No Priority 1, High 3, Normal 5), pie `Open Tasks by Assignee`.

### 19.6 `report sample view.PNG`

A separate marketing dashboard, not the ClickUp card chrome of report 1. Cards: line `Sprint 1`, list `Upcoming features`, bar `Tasks left` (Total and Done), progress `Goals`, donut `Project status` with center `57 Tasks`, area `Workload` by Week 1–3.

**Interactions visible across these cards:** Filter, gear, overflow, refresh, and expand icons on card headers. Add Card. A tooltip on hover of a chart segment. None of the menus are open.

**Data a card needs:** Title, one or more series (label, value, color), optional percent, optional refresh time, optional filter count.

**States not shown:** Empty card, failed card, a card being added, a card being resized. Report 1 shows a welcome state when the dashboard has no custom layout, but that welcome copy is ClickUp's.

## 20. Reports — sprint overview counts

**File:** `docs/design/reports/total overview on sprint.PNG`

Four cards in a row:

| Card | Value | Extra controls |
|---|---|---|
| Total Tasks | 14 | filter, gear, `...` |
| Not Started | 0 | filter with badge `1`, gear, `...` |
| Overdue | 0 | filter with badge `1`, gear, `...` |
| Completed | 1 | filter with badge `1`, gear, `...` |

The filter menus are not open. The badge `1` is visible and not explained.

## 21. Reports — time

### `time reporting.PNG`

Card `Time Reporting`. Range `Last 30 days`. Person filter and two other icons. Columns ESTIMATED and TRACKED.

| Person | Estimated | Tracked |
|---|---|---|
| Eric C. | 0:00:00 | 6:17:00 |
| Bryce | 12:00:00 | 10:35:00 |
| Leslie | 9:00:00 | 5:13:00 |
| Daniel | 5:00:00 | 5:33:00 |

Each row has a chevron. Expanded rows are not shown.

### `time sheet.PNG`

Card `Time Sheet`. Week `Mar 31 - Apr 6` with previous and next. Columns: PERSON, TOTAL, then one column per day (SUN 31 through at least FRI).

| Person | Total | Days with a colored block |
|---|---|---|
| Eric C. | 9:37:00 | Thursday is orange. Other visible days are gray |
| Daniel | 5:33:00 | Tuesday and Thursday are blue |
| Leslie | 5:13:00 | Monday is blue |
| Bryce | 10:35:00 | Monday, Tuesday, and Wednesday are blue |

Gray blocks are visible on days that are not highlighted. The legend is not shown.

### `time sheet hover times.PNG`

Hover on Daniel's Thursday block shows a dark tooltip: `3.12 out of 8 hours`. The card also shows `Refreshed just now`.

**API conflict:** The existing workload report sums integer hours per user. It has no per-day series and no `HH:MM:SS`. The proposed pivot can sum `timeEstimateHours` and `timeTrackedHours` by assignee. It cannot draw this week grid or the 8-hour capacity line unless a new contract is approved.

## 22. Reports — tasks by person

**File:** `docs/design/reports/tasks by each person.PNG`

Card with columns `People` and `Amount of tasks worked on`. Bryce is expanded and shows `3`. Under Bryce, three tasks, each with the path `Product > Content Development > List`:

- Email Template Upgrade (green check)
- Reproduce the login error. (gray status icon)
- Product Tutorials (yellow status icon)

Daniel 2, Eric C. 18, Harrison 3. A download icon is on the card.

**Interactions visible:** The count expands to the task list. Export is a download icon. The file type is not shown.

## 23. Reports — sprint charts

### `speint report.PNG`

Two cards for `Design / [Sprint 108] (11/7-11/13)`.

**Sprint Burndown.** Metrics: Total effort `0 pts · 100%`, Guideline `0 pts · 0%`, Completed effort `0 pts · 0%`, Remaining effort `0 pts · 0%`. Line chart, Y axis Sprint Points 0–10, X axis Nov 7–Nov 13. A gray band covers later days. Legend: Total effort, Guideline, Remaining effort, Completed daily, Non-working days. Footnote: dates in PDT, sprint index 108, days begin at 12:00 AM, remaining effort and guideline are based on planned tasks when the forecast is locked.

**Sprint Burnup.** Metrics: Total effort `0 pts · -100%`, Guideline `5.5 pts · 100%`, Completed `0 pts · 0%`, Started `5.5 pts · 100%`. Y axis 0–6. Legend: Total effort, Guideline, Completed, Started, Completed daily, Non-working days.

### `sprint report 2.PNG`

Bar `Workload by Status`: Ready For Launch 4, Design Complete 2, Complete 1, Ready 1, Ready 6. These status names are not the product enum.

Line `Cycle Time`, Y axis days (0, 11d, 23d, 34d), X axis 7 Nov–14 Nov. Tooltip: `Thursday, Nov 9` and `Cycle Time: 18d`. `Refreshed 4 mins ago`.

### `sprint report 3.PNG`

Pie `Tasks by Assignee`: Ashley Bradley 3, Unassigned 1, Chris Cunningham 1, Nenad Merčep 1, and a large green slice whose label is cut off. `Refreshed 4 mins ago`.

**API overlap:** Workload by status and tasks by assignee can be expressed with the proposed pivot (`status` or `assignee` by `taskCount`) and already exist in simplified form on `GetProjectWorkload`. Burndown, burnup, cycle time, non-working days, guideline, and forecast lock do not.

## 24. Screens with no reference image

| Screen | Current route or absence |
|---|---|
| Login | `/login` |
| Register | `/register` |
| Workspace home | `/project/list` |
| Project create and edit | `/project/form`, `/project/form/:id` |
| Sprint create and edit as a page | `/sprint/form`, `/sprint/form/:id` |
| Central search results | No route. A search box appears only inside the ClickUp chrome of the marketing list |
| Bulk action bar | No screenshot. The current list has a status-only bar |
| Permission denied | No screenshot |
| Pivot field picker | No screenshot. The report images are fixed cards, not a configurable pivot |

## 25. Cross-screen navigation that is visible

| From | Control | Lands on |
|---|---|---|
| Sidebar | A list name | That list, List tab selected in the Design crop |
| Sidebar | A sprint row | Not shown in the same image. The board breadcrumb is a sprint, so a sprint can open the board |
| View tabs | List, Board | The same container in the other layout |
| View tabs | Sprint Reporting | Not opened |
| `+ Create Sprint` | Button | Create Sprint dialog |
| `+ Task` | Button | Create task modal in one image. The board uses a different inline composer |
| Task row or card | Click | Not shown. The detail view exists as its own image |
| Document in the tree | Click | Not shown. The editor exists as its own image |
| All Channels | A row | Not shown. The conversation exists as its own image |
| Chat tabs | Calendar, Tasks | Not opened |

Calendar, Gantt, Timeline, Table, Team, Channel, and Sprint Reporting are visible tabs. Their screens were not supplied, except the report images in section 19–23, which are cards rather than the Sprint Reporting tab.
