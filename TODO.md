# Profile Menu Implementation

## Steps

- [x] 1. Analyze codebase and understand AuthService, TaskList, TaskForm
- [ ] 2. Create ProfileMenu component (TS, HTML, CSS)
- [ ] 3. Update TaskList to use ProfileMenu
- [ ] 4. Update TaskForm to use ProfileMenu
- [ ] 5. Test and verify

# TaskUserService Implementation

## Steps

- [x] 1. Analyze codebase patterns (TaskService, UserService, environment)
- [x] 2. Create TaskUserService (`src/app/services/task-user-service.ts`)
- [x] 3. Create TaskUserService spec (`src/app/services/task-user-service.spec.ts`)
- [x] 4. Add `UserIds` to `CreateTaskDto` and `AddTaskInput`
- [x] 5. Update `task-api.mappers.ts` to include `UserIds` in `toCreateDto`
- [x] 6. Update `TaskForm` to load users, show multi-select checkboxes, and send `userIds` on create
