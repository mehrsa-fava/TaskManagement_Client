# Inline Editing Implementation TODO

## Plan

- [x] Create TODO.md
- [x] Update `task-list.ts` — add inline editing state, helper methods, and imports
- [x] Update `task-list.html` — make title, description, status, and priority clickable/editable
- [x] Update `task-list.css` — add dropdown styles
- [x] Verify build and test

## Implementation Details

### Inline Editing Features

1. **Title** — Click title text to edit inline. Press Enter to save, Escape to cancel. Blur also saves.
2. **Description** — Click description text (or "+ Add description" if empty) to edit inline. Same key handlers.
3. **Status** — Click status badge to open a dropdown with all status options, each showing its color. Selecting an option immediately saves via `/UpdateTaskById`.
4. **Priority** — Click priority flag icon to open a dropdown with all priority options, each showing its color. Selecting immediately saves.

### Status Colors in Dropdown

- Open: bg-slate-100 text-slate-700
- InProgress: bg-amber-100 text-amber-800
- Completed: bg-emerald-100 text-emerald-800
- InReview: bg-indigo-100 text-indigo-800
- Accept: bg-purple-100 text-purple-800
- Reject: bg-red-100 text-red-800
- Done: bg-green-100 text-green-800
- Pending: bg-blue-100 text-blue-800
- Block: bg-gray-100 text-gray-800

### API Integration

All inline edits call `TaskService.updateTask(id, input)` which sends a `PUT` request to `/UpdateTaskById`.
