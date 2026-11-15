# Agent workflow

1. Read `docs/CLIENT_ARCHITECTURE.md` and the nearest screen before adding files.
2. Use the `angular-feature-implementation` skill for one screen or service.
3. Use the `angular-clickup-ux` skill when the shell, sidebar, list, or a new view changes.
4. Attach `ai/roles/angular-frontend-engineer.md` for implementation and `ai/roles/ux-product-designer.md` when the task is layout or interaction.
5. Match `AuthService`, the existing route guards, and Tailwind. Do not add PrimeNG.
6. Run `ng test` for the spec you touched, and `ng build` when the template or routes change.
7. Check the flow in the browser: sign in, open a project, and exercise the screen you changed, including the Employee path when the screen is a project or sprint form.

Do not generate the whole workspace in one change. The API repository owns persistence, authorization, and GitLab.
