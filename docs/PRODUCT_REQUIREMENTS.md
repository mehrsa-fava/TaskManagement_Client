# Task Management Platform — Product Requirements

**Document status:** Initial requirements draft  
**Scope:** Frontend and backend  
**Purpose:** Shared product specification for implementation with Cursor  
**Important:** This document captures the requirements described so far. UI screenshots, detailed workflows, permissions, technical choices, and acceptance criteria will be added as they are provided.

---

## 1. Product Overview

Build a project-based task management platform with:
- Projects, members, tasks, folders/backlogs, and sprints.
- Rich task collaboration: attachments, relations, checklists, comments, tags, and bulk actions.
- A self-hosted document editor for word-processing and spreadsheets.
- Project chat with real-time messaging.
- Central search across projects, tasks, and documents.
- Pivot-grid reporting.

The UI should follow the design references and screenshots supplied by the product owner. Do not assume a new visual design where a reference image exists.

## 2. Folder Feature

- Users can create named folders within a project.
- A folder contains tasks and acts as a backlog-like container.
- The folder view should follow the same general interaction and visual pattern as the Sprint view.
- Tasks should be movable between folders and sprints.
- Folder behavior, ordering, permissions, and whether folders can be nested remain to be specified.

## 3. Documents

### 3.1 Document types and editing
- Users can create and edit documents comparable to word-processing documents and spreadsheets.
- The intended experience should be comparable to Google Docs and Google Sheets, or better.
- The solution should be self-hosted/local to this product rather than depending on Google Docs or Google Sheets.
- Editing, saving, collaboration, version history, import/export, and supported file formats need a technical design decision.

### 3.2 Document organization
- Provide a dedicated Documents area/folder for documents.
- Documents should be searchable by title through Central Search.
- Document permissions and whether documents belong to a project, a folder, or both remain to be specified.

## 4. Task Attachments

- Each task can have multiple file attachments.
- Users should be able to upload and access attached files from the task.
- File size/type limits, previews, download behavior, storage provider, and attachment permissions remain to be specified.

## 5. Task Relations

- A task can be related to one or more other tasks.
- The relation types (for example, blocks, is blocked by, relates to, duplicates) and whether relations are directional remain to be specified.
- The UI should make related tasks accessible from the task details view.

## 6. Task Checklists

- Each task can contain multiple checklists.
- Each checklist has a user-defined title.
- Each checklist contains multiple items that users can add and mark complete/incomplete.
- Checklist ordering, item assignment, due dates, and progress display remain to be specified.

## 7. Task Comments

- Tasks support comments.
- Comment interactions should include:
  - Reactions.
  - Replies.
- Editing/deleting comments, mentions, attachments in comments, and permissions remain to be specified.

## 8. Bulk Task Actions

Users can select multiple tasks and apply bulk actions:
- Move selected tasks to another folder or sprint.
- Change the status of all selected tasks.
- Delete selected tasks.
- Add a tag to all selected tasks.
- Assign selected tasks to project members.
- Set the priority of selected tasks.

The UI should clearly show the number of selected tasks and provide appropriate confirmation for destructive actions. The backend must validate permissions and apply bulk operations consistently.

## 9. Tags

### 9.1 Tag picker
- Clicking the tag control opens a list of available tags.
- At the top of the list, show an input with the placeholder: `select or add...`.
- Users can select an existing tag or type a new one.

### 9.2 Tag creation and duplicate handling
When a user enters a tag:
1. Normalize the value using the requested rule: `.ToLower().Replace(" ", "")`.
2. Check whether a tag with the normalized value already exists in the relevant scope.
3. If it exists, select/reuse that existing tag; do not create a duplicate.
4. Otherwise, choose a random color and send the new tag to the backend.
5. Use the persisted tag returned by the backend in the UI.

**Implementation note:** The backend must enforce uniqueness as well. Client-side duplicate checking alone is not sufficient when multiple users create tags concurrently. Define whether tag uniqueness is global or project-scoped before implementation.

### 9.3 Tag colors
- Each tag has a color.
- Users can change a tag's color using a color palette.
- The selected color must be persisted by the backend and reflected wherever the tag appears.

## 10. Email Notifications

- Send an email notification to a user when they are assigned to a task.
- Send an email notification when a task's status changes.
- Notification preferences, duplicate-event handling, email templates, and delivery/retry behavior remain to be specified.

## 11. Sprint and Folder Task Filters

Provide task filters in both Sprint views and Folder/backlog views:
- Assignee/member: support selecting one or more members and show tasks assigned to the selected member(s).
- Status.
- One or more tags.
- Search by task title.
- Priority.

Filters should compose together (for example, assignee + status + tag). Define whether filters are local to the current view, saved per user, or shareable.

## 12. Central Search

- Provide a central search box.
- Search across:
  - All projects.
  - Task titles.
  - Document titles.
- Results should identify the result type and its project/context, and open the selected item.
- Search permissions must be enforced: users must not see results for projects, tasks, or documents they are not authorized to access.
- Search matching, sorting, pagination, and whether descriptions/content are searchable remain to be specified.

## 13. Chat System

### 13.1 Automatic project group
- Automatically create a group chat for each project.
- The group chat name should match the project name.
- Add all members of that project to the group.
- Define how membership changes are synchronized when project members are added or removed.

### 13.2 Project chat rooms
- Only the project admin/manager can create additional chat rooms for that project.
- The admin/manager chooses the new room title.
- Project membership and room permissions must be enforced by the backend.

### 13.3 Private conversations
- A project member can search for another member from the same project.
- Search results must include only members who share a project with the current user, subject to the intended access rules.
- Selecting a member opens the existing private conversation if one exists; otherwise, create a private conversation.
- Define behavior for users who share multiple projects and whether private conversations are unique globally or per project.

### 13.4 Real-time messaging
- Messages must be sent and received in real time.
- Use WebSockets, SignalR, or an equivalent real-time transport. SignalR is a natural option if the backend is ASP.NET Core.
- Persist messages; real-time delivery must not be the only copy of a message.

### 13.5 Message types and actions
Support:
- Text messages.
- Voice messages.
- Stickers.
- File uploads.
- Picture uploads.
- User mentions/tags.
- Editing a message for up to 15 minutes after it is sent.

Message deletion, reactions, replies, forwarding, and attachment limits remain to be specified.

### 13.6 Delivery and read indicators
- Show one tick when a message has been sent.
- Show two ticks when the message has been seen by the relevant recipient(s).
- Define exact semantics for group messages (for example, whether two ticks mean seen by at least one member or all members).
- The backend should track message delivery/read state reliably across reconnects and multiple devices.

### 13.7 Unread-message email reminders
- If a private message has not been seen within one hour, send an email reminder to the recipient.
- If a message mentions/tags a user and that user has not seen it within one hour, send an email reminder to that user.
- The reminder should identify the sender and indicate that there is a new message.
- Avoid sending repeated reminders for the same message unless explicitly required.
- Define how read state, notification preferences, quiet hours, and email failures affect reminders.

## 14. Pivot Grid and Reports

- Provide a Pivot Grid feature for reporting and data analysis.
- The report feature should allow users to analyze supported data through configurable row fields, column fields, measures/aggregations, and filters, subject to the chosen Pivot Grid library.
- Define data sources, supported dimensions/measures, export formats, saved reports, permissions, and performance requirements.
- The Pivot Grid must use authorized data only.

## 15. Cross-Cutting Requirements

These apply to both frontend and backend:
- Enforce authorization on the backend; hiding a UI control is not sufficient security.
- Validate inputs on the backend.
- Handle loading, empty, error, and success states in the UI.
- Provide clear feedback for failed uploads, bulk actions, message sends, and document saves.
- Avoid duplicate records for tags, private conversations, and notification events where uniqueness is required.
- Design real-time features to recover after disconnect/reconnect.
- Consider pagination or virtualization for large task, message, and document collections.
- Record important operations where auditability is needed.

## 16. Open Decisions — Do Not Guess

The following details need confirmation before final implementation:
1. Exact frontend and backend frameworks/versions and current architecture.
2. Project roles and permission matrix (admin, manager, member, and any other roles).
3. Folder nesting, folder ordering, and task behavior when a folder is deleted.
4. Whether documents are project-scoped, folder-scoped, or both.
5. Self-hosted document editor choice and required compatibility with DOCX/XLSX.
6. File storage approach, file limits, and allowed formats.
7. Task relation types.
8. Checklist item capabilities.
9. Comment editing/deletion and mention behavior.
10. Tag uniqueness scope: global or per project.
11. Email provider and notification preferences.
12. Chat behavior for members shared across multiple projects.
13. Exact group read-receipt semantics.
14. Whether chat supports message replies/reactions in addition to task comments.
15. Pivot Grid data sources and report requirements.
16. UI screenshots, responsive behavior, and interaction details.

## 17. Implementation Guidance for Cursor

- Treat this document as the shared product requirements source, not as permission to redesign existing architecture.
- First inspect the existing frontend and backend repositories. Identify current models, APIs, components, conventions, authentication, authorization, and tests.
- Do not replace working features or introduce a new architecture without explaining why and obtaining approval.
- Before implementing a feature, provide:
  1. A concise analysis of the existing implementation.
  2. The proposed changes and affected files/modules.
  3. API/data-contract changes, if any.
  4. An implementation plan.
  5. Tests and acceptance criteria.
- Implement incrementally. Keep frontend and backend contracts aligned.
- Do not use mock data as a substitute for backend integration except in explicitly requested UI prototypes.
- Do not hard-code secrets, credentials, or environment-specific URLs.
- Add or update tests for business rules, permissions, and important edge cases.
- If a requirement is ambiguous, list the ambiguity and ask before making a consequential product decision.
- Follow the supplied UI screenshots and design references. Do not invent a different layout when a reference exists.

## 18. Feature Acceptance Checklist

This checklist will be expanded as the requirements and designs are clarified.

- [ ] Project folders can be created and contain tasks.
- [ ] Folder view follows the Sprint view interaction/design pattern.
- [ ] Documents can be created, organized, searched, and edited in the self-hosted editor.
- [ ] Tasks support multiple attachments.
- [ ] Tasks support relations to other tasks.
- [ ] Tasks support multiple titled checklists.
- [ ] Task comments support reactions and replies.
- [ ] Bulk task actions support all listed operations.
- [ ] Tag creation normalizes values, reuses duplicates, assigns a color, and persists changes.
- [ ] Tags can be recolored from a palette.
- [ ] Assignment and status changes trigger email notifications.
- [ ] Sprint and folder views support all listed filters.
- [ ] Central search covers projects, task titles, and document titles with permission filtering.
- [ ] Each project has an automatically maintained group chat.
- [ ] Only project admins/managers can create project chat rooms.
- [ ] Members can start or reopen eligible private conversations.
- [ ] Chat supports real-time delivery and all listed message types/actions.
- [ ] Message editing is limited to 15 minutes.
- [ ] Read receipts follow the agreed group/private semantics.
- [ ] Eligible unread private/mentioned messages trigger a one-hour email reminder.
- [ ] Reports include a Pivot Grid.

---
*End of initial requirements draft.*
