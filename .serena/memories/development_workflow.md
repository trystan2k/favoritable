# Development Workflow and Guidelines

## Fundamental Principles
- **NEVER** start implementing without explicit request
- **ALWAYS** start from updated `main` branch
- **MANDATORY** use `pnpm` package manager
- **REQUIRED** follow strict quality gates

## Standard Development Workflow

### 1. Task Reception & Planning
1. Receive task with clear ID from Task Master system
2. Use MCP Task Master to get full task details
3. Create detailed action plan using deepthink methodology
4. Mark task as `in-progress` in Task Master

### 2. Quality Verification (Pre-Development)
```bash
# MANDATORY: Run before starting any development
pnpm run complete-check
```
- If ANY issues exist, fix them before proceeding
- Never start development with failing QA

### 3. Implementation Process
1. Ensure local `main` is up-to-date with remote
2. Create feature branch: `feature/FAV-[ID]-[title]`
3. Implement following the deepthink plan
4. One feature branch per task ID (all subtasks in same branch)

### 4. Subtask Development Cycle
For each subtask:
1. **Implement** following plan
2. **Quality Check** - `pnpm run complete-check` 
3. **Review Request** - Ask for human code review
4. **Commit** - One commit per completed subtask
5. **Push Request** - Ask permission to push
6. **Repeat** for next subtask

### 5. Commit Standards
```bash
# Pattern: type(scope): brief description of work done
feat(bookmarks): add bookmark creation endpoint
fix(labels): resolve duplicate label validation
refactor(auth): improve error handling
```
- Focus on what was done, not task references
- Never include agent information
- Each subtask gets one focused commit

### 6. Final Task Completion
1. All subtasks completed and committed
2. Final QA check: `pnpm run complete-check`
3. Update task with implementation details
4. Mark as `done` in Task Master
5. Create development log in Basic Memory MCP
6. Create physical log file: `docs/memories/development-logs/task-[ID]-[title].md`
7. Request permission for final push
8. Create PR with human approval

## Quality Requirements
- **Zero Tolerance**: No warnings or errors allowed
- **Coverage**: Meet test coverage thresholds
- **Type Safety**: Maintain strict TypeScript compliance
- **Linting**: Pass all Biome checks
- **Building**: Successful production build

## Branch Strategy
- **Main**: Always stable, production-ready
- **Feature Branches**: One per task, named `feature/FAV-[ID]-[title]`
- **No Subtask Branches**: All subtasks committed to same feature branch
- **Clean History**: Each commit represents working, tested code

## Documentation Requirements
- Log all development in Basic Memory MCP
- Create physical development logs for completed tasks
- Include implementation details, decisions, and observations
- Track time spent and approach used