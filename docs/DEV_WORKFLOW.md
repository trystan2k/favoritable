# Development Workflow Guide

## ⚠️ ### FUNDAMENTAL PRINCIPLES

THESE INSTRUCTIONS ARE MANDATORY and must be strictly followed throughout development. No item can be neglected. NEVER ASSUME ANYTHING - ALWAYS ASK IF IN DOUBT.

- **Attention**: NEVER, NEVER start to implement a task without been requested to do so.
- Also always start the task from the `main` branch and ensure it is up-to-date with remote.
- **Important**: Remember that this project use `pnpm`.

## 🔄 STANDARD WORKFLOW

### 1. 📋 TASK RECEPTION

- Receive the task or subtask to be developed
- Identify the task ID in the Task Master system
- **Action**: Await clear instructions on which task to implement

### 2. 🔍 OBTAINING DETAILS

- **Action**: Use **MCP Task Master** to get full details (never the CLI tool)
- Extract essential information:
  - Title and description
  - Dependencies
  - Acceptance criteria
  - Test strategy
  - Specific technical details

### 3. 🧠 PLANNING WITH DEEPTHINK

- **Action**: Use `deepthink` to create a detailed action plan
- **Planning principles**:
  - ✅ **Simplicity**: Always seek the simplest solution
  - ❌ **Avoid overengineering**: Do not overcomplicate unnecessarily
  - 🎯 **Elegance**: Clean and well-structured solutions
  - 📝 **Documentation**: Clear and executable plan

**Deepthink plan template**:

```markdown
## Task Analysis
- Main objective:
- Identified dependencies:
- System impact:

## Chosen Approach
- Proposed solution:
- Justification for simplicity:
- Components to be modified/created:

## Implementation Steps
1. [Specific step]
2. [Specific step]
3. [Specific step]

## Validation
- Success criteria:
- Checkpoints:
```

### 4. 📊 STATUS UPDATE - START

- **Action**: Mark the task/subtask as `in-progress` in Task Master
- Confirm that the status has been successfully updated

### 5. 🔍 INITIAL QUALITY VERIFICATION

- **Action**: Run `pnpm run complete-check` before starting development
- **If problems are reported**:
  - ⚠️ **STOP** - do not proceed with development
  - Resolve ALL identified problems
  - Run `pnpm run complete-check` again until clean
  - Only then proceed to implementation

### 6. ⚙️ IMPLEMENTATION

- Follow the plan created in deepthink
- Ensure that local `main` branch is up-to-date with remote, otherwise update it
- Create a feature branch based on `main` and do your work on this feature branch
- Create one feature branch per task ID and commit all subtasks in this same branch (do not create branch for subtasks)
- Feature branch should follow the pattern `feature/FAV-[ID]-[title]`

#### 🔄 Subtask Development Cycle

For tasks with subtasks, follow this cycle for each subtask:

1. **Implement subtask** following the deepthink plan
2. **Quality check** - Run `pnpm run complete-check` before commit
3. **Review request** - Ask for code review before committing
4. **Commit subtask** - Create one commit per completed subtask
5. **Push request** - Ask for permission to push after commit
6. **Repeat** for next subtask

- **Each subtask = One commit** for better traceability
- Keep commits focused and atomic per subtask
- **Principles during implementation**:
  - 🎯 Focus on the essential
  - 📝 Comment code when necessary
  - 🧪 Write tests according to the defined strategy
  - 🔄 Perform incremental refactorings

### 7. 🔍 SUBTASK QUALITY VERIFICATION

- **Action**: Run `pnpm run complete-check` before each subtask commit
- **If problems are reported**:
  - ⚠️ **MANDATORY** - resolve ALL problems
  - Do not proceed to commit until QA is clean
  - Run again until it passes completely
  - If you are still struggling to fix it (cannot fix in 5 interactions, for example), ask for help

### 8. 📝 SUBTASK COMMIT CYCLE

For each subtask completion:

- **Action**: Before commit, ask me to review the changes and only continue after my ok
- **Action**: Ask me if I did any code change during review. If so, review the changes and use this info for the commit
- **Action**: Run `pnpm run complete-check` one final time before commit
- **Action**: Commit with descriptive message following the pattern below
- **Action**: Ask permission to push the subtask commit

**Subtask commit message pattern**:

```bash
type(scope): brief description of actual work done

- Specific changes made in this subtask
- Files modified/created
- Tests added (if any)
```

### 9. 🔍 FINAL QUALITY VERIFICATION

- **Action**: After ALL subtasks are complete, run `pnpm run complete-check` one final time
- **Action**: Ensure entire task implementation works as expected
- **If problems are reported**:
  - ⚠️ **MANDATORY** - resolve ALL problems
  - This is the final quality gate before task completion

### 10. ✅ TASK STATUS UPDATE - COMPLETION

- **Action**: Update the task with complete implementation details covering all subtasks
- **Action**: Mark the task as `done` in Task Master
- Confirm that the status has been updated correctly
- Confirm that all subtasks are marked as complete

### 11. 📝 DEVELOPMENT LOGGING

- **Action**: Use **Basic Memory MCP** to log development for all subtasks (if it exist, otherwise for the task implemented).
- **Action**: Once the task is complete, read all info related to it (task and subtasks notes) in **Basic Memory MCP** and create physical file with the information about the implementation of the task.
- **Log template** (should cover the entire task and all its subtasks):

```markdown
## Task Development #[ID]
**Date**: [Current date] (use `date "+%Y-%m-%d_%H:%M:%S"` in shell to get timestamp)
**Title**: [Task title]

### Summary
- Status: Completed
- Estimated time: [time]
- Time spent: [time]
- Approach used: [brief description]
- Subtasks completed: [list of subtask numbers if applicable]

### Implementation
- Modified files: [list]
- Tests added: [yes/no - details]
- Dependencies: [if applicable]
- Commits made: [brief description of each commit]

### Observations
- [Important points for future reference]
- [Technical decisions made]
- [Possible future improvements]
```

**MANDATORY**: Complete BOTH steps:

1. Store in Basic Memory MCP using `write_note` with folder "development-logs"
2. **ALSO** create the physical file using the `write` tool at `docs/memories/development-logs/task-[ID]-[title].md`
3. Use `read_note` from Basic Memory to get the content and copy it to the physical file

### 12. 💾 FINAL PUSH

- **Action**: Ask permission for final push of all subtask commits to feature branch
- Only push when all subtasks are complete and documented
- This push should include all subtask commits made during the task

### 13. ⛄ OPENING THE PULL REQUEST

- **Action**: Before create the PR, ask for my approval.
Use the Github MCP (or if not available Github CLI) to open a PR with a comprehensive and accurate description of the implementation.
- **Action**: Use Github MCP to request review from Copilot
**NEVER** Add any comment releated to the Agent doing the Pull request (for example, avoid any reference to opencode, claude code, gemini, etc)

### 14. 📢 COMPLETION NOTIFICATION

- **Action**: Notify about task completion
- **Notification format**:

```markdown
✅ Task #[ID] completed successfully

📋 [Task title]
🔧 Implementation: [brief summary]
✔️ QA: Passed all checks
💾 Commit: [commit hash]
📝 Log: Recorded in Basic Memory MCP
```

---

## 🛠️ COMMANDS AND TOOLS

### MCP Task Master

```bash
# Get task details
get-task --id [TASK_ID]

# Update status
update-task-status --id [TASK_ID] --status [in-progress|done]
```

### QA Scripts

```bash
# Full QA execution
pnpm run complete-check

# Individual checks (if available)
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

### Basic Memory MCP

```bash
# Log development
log-development --task-id [TASK_ID] --details "[details]"
```

---

## ⚡ MANDATORY CHECKS

### ✅ Before Starting Development

- [ ] Task clearly understood
- [ ] Details obtained via MCP Task Master
- [ ] Deepthink plan created and validated
- [ ] Status updated to `in-progress`
- [ ] Initial QA executed and clean

### ✅ During Development

- [ ] Following established plan
- [ ] Each subtask gets individual commit after review
- [ ] Quality check before each subtask commit
- [ ] Tests being written as needed
- [ ] Clean and well-structured code

### ✅ Before Each Subtask Commit

- [ ] Subtask implementation complete
- [ ] QA executed and 100% clean for subtask
- [ ] Code reviewed and approved
- [ ] Commit message follows subtask pattern

### ✅ Before Final Task Completion

- [ ] All subtasks completed and committed
- [ ] Final QA executed and 100% clean
- [ ] Task status updated to `done`
- [ ] Development log covers entire task
- [ ] All commits ready for final push

### ✅ After Completion

- [ ] All subtasks committed individually
- [ ] Task status updated to `done`
- [ ] Log recorded in Basic Memory MCP
- [ ] Physical development log file created in docs/memories/development-logs/
- [ ] Final push completed with all subtask commits
- [ ] Completion notification sent

---

## 🚫 NO NO Actions (Development Guidelines)

Based on your development guidelines, here are the **NO NO actions**:

---

## 🔴 Development Workflow Violations

- **NEVER** skip steps in the mandatory development workflow  
- **NEVER** commit when QA fails (`pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm build` must all pass)  
- **NEVER** continue if QA check fails because 'errors were already there'. In cases like this, ask me if you can skip or fix them.
- **NEVER** work without marking task in-progress first  
- **NEVER** complete task without documentation (development memory logging)  
- **NEVER** commit failing QA – Quality gates are mandatory  
- **NEVER** Assume unspecified requirements
- **NEVER** Overengineer solutions
- **NEVER** Include any agent information in the commit message (like Co-Authored-By:)
- **NEVER** reference task or subtask IDs in commit messages - focus purely on the work done
- **NEVER** create physical development logs for subtasks - only for complete tasks
- Under **NO** circumstance commit code when there are issues from QA scripts (even warnings)  

---

## 📁 File Creation Violations

- **NEVER** create files unless absolutely necessary for achieving your goal  
- **NEVER** proactively create documentation files (`*.md`) or README files  
- **ALWAYS** prefer editing existing files to creating a new one  

---

## 🧪 Testing Violations

- **NEVER** use `.spec.ts` extensions – Use `.test.ts` only  
- **NEVER** use `specs` directories – Use `tests` only  
- **NEVER** use `fireEvent` – **ALWAYS** use [`@testing-library/user-event`](https://testing-library.com/docs/user-event/intro)  
- **NEVER** wrap `userEvent` calls in manual `act()` blocks  
- **NEVER** commit tests with warnings  

---

## 🏗 Architecture Violations

- **ALWAYS** get documentation information about libraries from Context7 MCP, before start to using them
- **NEVER** assume libraries are available – Always check existing usage first  
- **NEVER** add comments unless explicitly asked  
- **NEVER** skip existing patterns – Follow codebase conventions  
- **NEVER** commit secrets or keys to repository  

---

## 📋 TaskMaster Violations

- **NEVER** use `force` when creating new tasks (keep historical reasons)  
- **NEVER** work on tasks without proper status tracking  

---

## ✅ The Golden Rule

> Do what has been asked; nothing more, nothing less.

---

These are the absolute prohibitions that will break your development workflow, code quality, or project standards.

---

## 🆘 IN CASE OF PROBLEMS

### QA Failing

1. **STOP** all implementation
2. Analyze reported errors
3. Resolve one by one
4. Run QA again
5. Only continue when 100% clean

### Doubts about Requirements

1. **DO NOT ASSUME** - always ask
2. Consult task details in Task Master
3. Request specific clarifications
4. Document clarifications for future reference

### Technical Problems

1. Consult previous development logs
2. Check task dependencies
3. Request specific technical guidance
4. Document solution for similar cases

---

## 📊 QUALITY METRICS

The workflow is considered successful when:

- ✅ 100% of QA checks pass
- ✅ Task implemented as per specification
- ✅ Status correctly updated in Task Master
- ✅ Complete log recorded in Basic Memory MCP
- ✅ Clean and well-documented commit
- ✅ Zero rework needed

---

**Remember: This workflow ensures quality, traceability, and consistency. Following each step religiously is fundamental to project success.**
