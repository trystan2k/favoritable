# AGENTS.md – Coding Agent Guide for favoritable

## ‼️ IMPORTANT: ubagents delegation

1. **GIT**: When any git (like git status, git pull, git push, git commit, git diff, git fetch or using Github MCP to create PR, read PR reviews, etc) command/operation needs to be done, delegate it to the @git-specialist subagent with all needed information
2. **TASK-MASTER**: When any operation needs to be done in task-master (like read task status, create task, update task, etc), delegate it to the @task-master-specialist subagent with all needed information
3. **BASIC-MEMORY**: When any operation needs to be done in basic memory (like read note, create development log note, etc), delegate it to the @basic-memory-specialist subagent with all needed information
4. **TESTS**: When you need to write/update/run tests for a task/implementation, delegate it to the @tester-specialist subagent with all needed information

## 📚 Onboarding

At the start of each session, read:

1. Any `**/README.md` docs across the project
2. Any `**/README.*.md` docs across the project

## Project context

### API

For context about the API project (apps/api), see document [CONTEXT.md](apps/api/docs/CONTEXT.md)

### Frontend

For context about the Frontend project (apps/frontend), see document [CONTEXT.md](apps/frontend/docs/CONTEXT.md)

## Build, Lint, and Test Commands

- **API**
  - Build: `pnpm build` (TypeScript)
  - Dev: `pnpm dev`
  - Typecheck: `pnpm typecheck`
  - Lint: `pnpm lint` (Biome), `pnpm lint:fix` to fix issues
  - Format: `pnpm format` (Biome), `pnpm format:fix` to fix issues
- **Frontend**
  - Build: `pnpm build` (Rsbuild)
  - Dev: `pnpm dev`
  - Typecheck: `pnpm typecheck`
  - Lint: `pnpm lint` (Biome)
  - Format: `pnpm format` (Biome)
- **Testing**: Vitest for unit and integration tests
  - Run tests: `pnpm test`
  - Run tests with coverage: `pnpm test:coverage`
  - Run tests for a specific file: `pnpm test <file_path>`
  - Run a specific test: `pnpm test -t <test_name>`

- For any of these commands, if you need to run for a specific project in the monorepo, just use `pnpm turbo run <command> --filter <project_name>`
  - Example: `pnpm turbo run test --filter api` to run tests only for the API project
  - Example: `pnpm turbo run lint --filter web` to lint only the web project
  - Example: `pnpm turbo run format --filter web` to format only the web project

## Code Style Guidelines

- **Indentation**: 2 spaces (see .editorconfig)
- **Line endings**: LF, final newline, trim trailing whitespace
- **Imports**: Use ES module syntax (`import ... from ...`)
- **TypeScript**: Strict mode, use explicit types, enable decorators
- **Naming**: camelCase for variables/functions, PascalCase for types/classes
- **Formatting**: Use Biome (`pnpm format`) - unified tool as per ADR 005
- **Linting**: Use Biome (`pnpm lint`) - unified tool as per ADR 005
- **Error Handling**: Prefer explicit error types, use TypeScript safety
- **File structure**: Organize by feature/module, keep related files together
- **No Cursor/Copilot rules present**

_Refer to this guide for agentic coding in this repository. Update if new tools or rules are added._
