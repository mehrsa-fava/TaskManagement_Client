# Design system

**Status:** Analysis only. Not approved for implementation.  
**Sources:** Every image in `docs/design/`, the current Angular styles, and `docs/FRONTEND_UX.md`.  
**Rule:** Colors and sizes below are either copied from existing CSS or described as they appear in the screenshots. Pixel values and hex codes are not measured from the PNGs.

`docs/FRONTEND_ARCHITECTURE.md` does not exist. The client architecture source is `docs/CLIENT_ARCHITECTURE.md`.

## 1. How to use this document

The screenshots are ClickUp references. They show layout, density, and interaction patterns. They also show ClickUp chrome that this product does not own: the ClickUp wordmark, Brain / AI, Integrate, Ask, Share, SyncUp, Follow, Spaces, Whiteboards, Reminders, and Gantt.

`docs/FRONTEND_UX.md` already says to extend the existing shell and not to copy ClickUp brand assets or add a second Spaces / Folders / Lists tree. `docs/PRODUCT_REQUIREMENTS.md` says to follow the supplied screenshots and not invent a different layout where a reference exists.

Those two instructions conflict on navigation chrome. Section 13 lists the decision. Until it is approved, this document records both the existing app and the visible reference, and it does not choose a new visual language.

No screenshot shows a dark theme of the workspace. The existing app is light.

## 2. Existing app tokens

These values are in source today.

| Token | Value | Where |
|---|---|---|
| Primary | `#4f46e5` (`--color-primary`) | `src/styles.css` |
| Primary hover | `#6366f1` (`--color-secondary`) | `src/styles.css` |
| Shell background | `#f8fafc` | `src/app/layout/app-shell.css` |
| Sidebar background | `#fff` | `src/app/project-sidebar/project-sidebar.css` |
| Sidebar border | `#e8edf2` | same |
| Sidebar text | `#1f2937`, title `#111827` | same |
| Sidebar width | `17.5rem`, fixed | same |
| Muted status text | `#6b7280` | same |
| Error text | `#dc2626` | sidebar; forms also use Tailwind `text-red-600` |
| Login page background | Tailwind `bg-gray-50` | `login.html` |
| Login title | Tailwind `text-indigo-600`, `text-4xl`, bold | `login.html` |
| Login card | white, `rounded-xl`, `shadow-lg` | `login.html` |
| Inputs on login | `rounded-lg`, `border-gray-300`, focus ring indigo | `login.html` |

Status chips in the task list and board use Tailwind classes in `src/app/utils/task-status.util.ts`:

| Status | Header treatment in code |
|---|---|
| Open | slate |
| Pending | amber |
| In Progress | pink |
| Completed | zinc, near-black, white text |
| In Review | orange |
| Accepted | rose |
| Rejected | purple |
| Blocked | violet |
| Closed (`Done`) | emerald |

Tag colors in code are the eight API colors: Red, Green, Blue, Yellow, Pink, Purple, Brown, Black, mapped to light Tailwind chips in `src/app/model/tag.ts`.

Dates in the running app are Shamsi via `persian-date-input` and `jalali-date.util.ts`. The screenshots show Gregorian labels (`2025-03-25`, `Nov 9-15`, `1405/06/22` inside a document title). Which calendar a given screen uses is an open decision. Do not restyle dates until that is approved.

## 3. Colors observed in the screenshots

No hex value is taken from a PNG.

| Role | What is visible |
|---|---|
| Page | White content area |
| Primary action | Solid purple fill, white label (`+ Task`, `Create`, `Create Task`, `Create Channel`, `Save`) |
| Secondary action | White or transparent button, gray text (`Cancel`, `Follow`, `Import`) |
| Borders | Light gray hairlines on rows, cards, inputs, and dialogs |
| Selected row | Light gray fill (sidebar `Design`, folder `test`, sprint row) |
| Group headers | Status name in a colored pill, plus a count |
| Overdue date | Red text (`2025-03-25` in the Design list) |
| Unread / count badge | Pink or red rounded count (sidebar `9`, sprint `12`, `18`) |
| Warning banner | Pale pink bar: "This sprint has 18 unfinished tasks" |
| Empty column | Pale tint matching the status (yellow Pending, orange In Review, red Accepted) |
| Tags | Small rounded pills. Visible fills include purple, blue, and beige. Text is darker than the fill |
| Avatars | Circle with initials. Visible fills include teal, green, purple, and photo avatars |
| Sprint state | Green outlined circle for a completed or active sprint; a blue partial circle for the current sprint; a gray dashed circle for the last, not-started sprint |
| Document highlights | Green, orange, and red inline marks inside body text. These are content, not chrome |
| Destructive | Not shown as a styled button in the screenshots. The current app uses a red icon button and `window.confirm` |

Status pills visible on the board and list, in screenshot order: Open (gray), Pending (yellow), In Progress (pink), Completed (black), In Review (orange), Accepted (red), Blocked (purple). Rejected and Closed are in the API and in the current board, and they are not visible in these crops.

## 4. Typography

The screenshots do not name a font. The current app does not set a custom font family, so the browser default applies.

Visible hierarchy:

| Use | Appearance |
|---|---|
| Task title in the detail view | Large, dark, regular-to-semibold |
| Document title | Larger than body, bold (`MVP 2: 1405/06/22`) |
| Dialog title | Medium, semibold (`Create Sprint`, `Create Channel`, `Doc settings`) |
| Section labels | Small, gray (`Status`, `Assignees`, `Sprint name`) |
| Table headers | Small, gray, regular (`Name`, `Assignee`, `Due date`, `Priority`) |
| Body and chat text | Regular, dark |
| Helper text | Smaller, gray (`Must include {INDEX}...`, channel description) |
| Counts | Same size as the adjacent label, often inside a pill |

Do not introduce a new type scale until a font is approved.

## 5. Spacing

Screenshots are cropped, so spacing is described by relationship, not by pixels.

- Sidebar rows are compact. Icon, label, and trailing count sit on one line.
- Nested items indent under the parent folder.
- List rows are short. Name, assignee, due date, and priority share one row.
- Board columns sit side by side with a small gap and scroll horizontally when they overflow.
- Cards inside a column stack with a small gap.
- Dialogs use a single column of fields with space between label and control.
- The task detail view is a vertical property list: icon plus label on the left, value on the right.
- Report cards sit in a loose grid with white space between cards.

The current sidebar uses `0.45rem` vertical padding on a project row and `0.5rem` horizontal page padding. The task list content is capped at `88rem`.

## 6. Borders and radii

| Element | What is visible |
|---|---|
| Inputs and search | Fully rounded or large radius, light gray border. Focus on the channel search and Create Channel name is a purple border |
| Primary buttons | Fully rounded or large radius |
| Task cards | White, light border, medium radius |
| Status pills | Fully rounded |
| Tag pills | Fully rounded |
| Avatars | Circle |
| Dialogs | White panel, medium radius, close icon at the top right |
| Report cards | White, light border or soft shadow, medium radius |
| Checklist block | White inset card, light border, medium radius |
| Sidebar selection | Light gray rounded rectangle |

The current login card uses `rounded-xl`. The current sidebar project row uses `border-radius: 0.5rem`.

## 7. Shadows

Dialogs and report cards sit above the page. The screenshots show a soft drop shadow on dialogs and dashboard cards. The current login card uses Tailwind `shadow-lg`. The current shell does not use a shadow on the sidebar; it uses a right border.

Do not add elevation to every row. List rows in the screenshots are flat, separated by hairlines.

## 8. Buttons

| Kind | Visible examples | Notes |
|---|---|---|
| Primary | `+ Task`, `Create`, `Create Task`, `Save`, `Create Channel`, `Sharing and Permissions` | Purple fill, white text. `+ Task` and `Create Task` have a small chevron, which implies a menu. The menu contents are not in the screenshots |
| Secondary | `Cancel`, `Follow`, `Import`, `View Profile` | Light background, dark text, border |
| Text / ghost | `+ Add Task`, `+ Create Sprint`, `+ Add item`, `+ Add checklist` | Colored text, no fill. Pink or purple in the references |
| Icon | Sidebar `+`, row `...`, dialog `×`, report card filter and gear | Small, no label except by tooltip, and no tooltip text is readable |
| Toggle | `Make Private`, `Add a List`, `Mark Doc as wiki` | Switch on the right of a label. Off state is gray. On state is not shown |
| Disabled | Not shown | The current task form disables `Add fields` and `Create checklist` |

The current app primary actions are indigo, not the purple in the screenshots. Changing that color needs approval.

## 9. Inputs

| Control | Visible behavior |
|---|---|
| Task title | Single line. Placeholder `Task Name or type '/' for commands` in the create modal and inline list row. Board inline placeholder is `Task Name...` |
| Description | Placeholder `Add description, or write with AI`. The AI control is ClickUp chrome |
| Search | `Search...` in the marketing shell, `Search tasks...` on a report card, `Search for Channels` on All Channels |
| Sprint name | Prefilled `Sprint 15 (11/30 - 12/6)` |
| Sprint goal | Multiline, placeholder `What does the team want to accomplish in this sprint?` |
| Channel name | Required. Placeholder `e.g. Ideas`. Purple focus ring |
| Chat composer | Placeholder `Write to Bamdad Bastani, press 'space' for AI, '/' for commands` |
| Dates | Calendar icon plus a formatted date. Create Sprint shows start and end |
| Tag entry | Not shown as the required `select or add...` field. The current task form uses `Search or add tags...` |

`/` command palettes and AI writing are visible and are not in the product requirements. Do not build them unless approved.

The current app uses native `<select>`, `<input type="date">`, and `app-persian-date-input`. The screenshots use custom dropdowns and date fields. Replacing native controls is a visual change and needs approval.

## 10. Dropdowns and menus

Visible menus:

- Location picker on create task: `Sprint 12 (11/9 - 11/15)`.
- Type picker: `Task`.
- Status on the detail view: `OPEN` with a chevron.
- Sprint duration: radio `Default (1 week)` selected, `Custom` unselected.
- Template: `Select a template...`.
- Doc settings: Rename, Copy link, Favorite, Move to, Duplicate, Archive, Delete, Save as template, Mark Doc as wiki, Sharing and Permissions.
- `+ View` on list and board toolbars. The opened menu is not shown.
- Date separator in chat: `Sunday, September 6th` with a chevron.

Menus that are indicated but not opened: `+ Task` chevron, row `...`, report card `...`, breadcrumb `...`, `Manage`.

The current task form uses a popover for assignees and tags, and a native select for status, priority, and type.

## 11. Tables and lists

The list reference is a grouped table, not a data grid.

- Groups are collapsible. A chevron sits left of the status pill.
- Columns visible: Name, Assignee, Due date, Priority. The current app also shows Sprint points.
- A group header can show `+ Add Task` and a count. The marketing list (`sprints/list view.PNG`) shows this. The Hidden Object Design list does not show `+ Add Task` on the group header.
- Inline create replaces a row: title field, icon buttons, `Cancel`, purple `Save`.
- Empty cells use a gray person, calendar, or flag icon.
- Assignee is an initials avatar. One row shows two avatars (`M` and `ME`).
- Tags sit on the name line after the title.
- A footer `Calculate` label appears under columns in the inline-create crop. Its action is not shown.

Board:

- One column per status, horizontal scroll.
- Column header: status icon, name, count.
- Card: title, assignee avatar, small icons, tag pills.
- Some cards show a fraction (`3/5`, `16 of 18`). The screenshots do not say whether that is checklist progress. The checklist screen separately shows `2 open`.
- `+ Add Task` at the bottom of a column. Clicking it opens a small card with title, assignee, dates, priority, tag, and `Save`.

Report tables and charts are cards, not the task table. See the report screens in `SCREEN_SPECIFICATIONS.md`.

## 12. Dialogs

| Dialog | Visible contents |
|---|---|
| Create Sprint | Title, close, sprint name, helper text about `{INDEX}`, template dropdown, link `Sprint settings`, duration radios, start and end dates, goal textarea, `Learn more about Sprints`, `Cancel`, `Create` |
| Create task | Tabs `Task`, `Doc`, `Reminder`, `Whiteboard`, `Dashboard`. Location and type dropdowns. Title. Description. Status, Assignee, Due date, Priority, Tags, overflow. `Create new field`. `Templates`. Attachment and watcher icons. `Create Task` |
| Create Channel | Title, description, required Name, Make Private toggle, Add a List toggle, `Import`, `Create` |
| Doc settings | Popover menu, not a full-page dialog |

The current sprint and task create flows are full pages (`/sprint/form`, `/task/form`), not dialogs. Switching them to dialogs changes navigation and needs approval.

Click targets that are not specified: template list, sprint settings destination, learn-more destination, what the Task chevron menu contains, whether Cancel discards a dirty form, and whether Escape closes the dialog.

## 13. Navigation

### 13.1 What the screenshots show

Left tree, top to bottom in `projects view in side bar.PNG`:

- Project row: colored letter tile, name, lock, trailing `+`.
- Expanded children under a project: `Backlogs` (chevron, `...`, `+`), then named lists with a count (`Design` 9, `Develope & Server` 3, `Art` 11, `Test` 9).
- Sibling rows: `Sprints`, `Documents`, `Project Lessons & Knowledge Base`, `Quality Control Checklist` with count `2`.
- Other projects collapsed: Jahangir, Coin Quest, Backgammon, each with a letter tile and a lock.
- `+ New Space` at the bottom.

Sprint folder (`sprints/sprint view.PNG`):

- Project `Jahangir` with lock and `+`.
- `Sprint Folder`.
- Sprint rows with a state icon, `Sprint N (start - end)`, and an optional pink count.
- `+ Create Sprint`.

Folder nesting (`folders/sub folder view.PNG`):

- `Phases` expanded.
- Child `test`.
- `+ Add item` under that child.
- Sibling list `Phase 1(06/15)`.

Documents in the tree (`documents/document sidebar view.PNG`):

- `Documents` expanded.
- Children are documents, not lists: `Release 3: 1405/06/29`, `MVP 2: 1405/06/22`, `Seed Validation`, `Onboarding on 1405/08/05`.

Main header, when the full page is in frame:

- Breadcrumb: project, folder, current list or sprint.
- View tabs. On the Design list: Channel, List (selected), Board, Calendar, Gantt, Timeline, Table, Calendar, List, `+ View`.
- On the sprint board: Add Channel, List, Board (selected), Team, Calendar, Gantt, Sprint Reporting, `+ View`.
- Right side: Integrate, Ask, Share, Manage, and a purple `+ Task`.

A second toolbar under that has a Status group control and icon buttons (columns, filter, closed, assignee, search, settings).

### 13.2 What the current app shows

`AppShell` is a fixed sidebar plus `<router-outlet>`.

Sidebar groups, per project:

- Reports
- Backlogs
- Sprints, expandable, with create, edit, and delete for non-employees

There is no Space, no nested folder, no Documents node, and no per-list count except a badge of open tasks on a completed sprint.

Main views are query `view=list|board|reports` on the backlog or sprint route. There is no Calendar, Gantt, Timeline, Table, Team, or Channel tab.

### 13.3 Decision required

Approve one of these before visual work starts:

1. Keep the current sidebar and add only the nodes the product requires: folders, documents, and chat entry points. Treat Calendar, Gantt, Timeline, Table, Team, Spaces, Integrate, Ask, and Share as out of frame.
2. Reproduce the screenshot tree, including nested folders and a Backlogs group of named lists.

The proposed folder API is a flat list (`id`, `projectId`, `title`, `sortOrder`). It cannot represent `Phases > test` until a parent field is approved. See the gap analysis.

## 14. Reusable UI patterns

These patterns repeat across screenshots and should be components, not copies. Responsibilities are in `FRONTEND_COMPONENT_ARCHITECTURE.md`.

| Pattern | Seen on |
|---|---|
| Project tree row | Sidebar, sprint folder, documents |
| Breadcrumb | List, board, task detail |
| View switcher | List, board, chat, dashboard samples |
| Status group | List |
| Task row | List, report task lists |
| Task card | Board |
| Inline task create | List row, board card |
| Property row | Task detail |
| Avatar | List, board, chat, reports |
| Tag pill | List, board, task detail |
| Count badge | Sidebar, sprints |
| Dialog shell | Create sprint, create task, create channel |
| Menu popover | Doc settings, and implied by `...` |
| Report card | Every report image |
| Chart | Pie, bar, stacked bar, line |
| Chat transcript | Direct conversation |
| Empty icon cell | Unassigned person, empty date, empty flag |

## 15. Theme

| Question | Evidence |
|---|---|
| Light workspace | Every content screenshot is white or near-white |
| Dark theme | Not shown for the app UI. `sprints/list view.PNG` has a dark top bar inside a ClickUp window on a purple desktop wallpaper. That is the reference product's chrome, not a theme toggle |
| Existing app | Light slate and indigo only. No theme switch |

Do not add a dark theme unless a reference or an explicit request is supplied.

## 16. States the screenshots do not specify

No image shows a loading spinner, an empty project, a failed request, a permission-denied page, a validation error under a field, or a destructive confirm. The product requirements require loading, empty, error, and success feedback. The current app uses a text line (`Loading tasks...`, `No projects yet.`, red `getApiErrorMessage` text) and `window.confirm` for delete.

Those current patterns stay until a design for each state is approved. Do not invent a new empty illustration.

## 17. Responsive behavior

| Source | What can be said |
|---|---|
| Screenshots | Desktop crops. The board extends past the right edge and implies horizontal scroll. No phone layout, no collapsed sidebar, no stacked columns |
| Current CSS | Sidebar is a fixed `17.5rem`. It does not collapse. `FRONTEND_UX.md` says the sidebar collapses on a narrow viewport; the CSS does not do that |
| Task detail | At `max-width: 900px` the activity pane stacks under the form |

A responsive specification needs a decision. The screenshots do not provide one.
