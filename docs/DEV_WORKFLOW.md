# Development Workflow Guide

## ⚠️ ### FUNDAMENTAL PRINCIPLES

THESE INSTRUCTIONS ARE MANDATORY and must be strictly followed throughout development. No item can be neglected. NEVER ASSUME ANYTHING - ALWAYS ASK IF IN DOUBT.

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

```
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
- Create a feature branch based on `main` and do your work on this feature branch
- Feature branch should follow the pattern `feature/FAV-[ID]-[title]`
- Keep commits small and frequent during development
- **Principles during implementation**:
  - 🎯 Focus on the essential
  - 📝 Comment code when necessary
  - 🧪 Write tests according to the defined strategy
  - 🔄 Perform incremental refactorings

### 7. 🔍 FINAL QUALITY VERIFICATION

- **Action**: Run `pnpm run complete-check` after completion
- **If problems are reported**:
  - ⚠️ **MANDATORY** - resolve ALL problems
  - Do not proceed to commit until QA is clean
  - Run again until it passes completely

### 8. ✅ STATUS UPDATE - COMPLETION

- **Action**: Mark the task/subtask as `done` in Task Master
- Confirm that the status has been updated correctly
- Update the task with implementation details

### 9. 📝 DEVELOPMENT LOGGING

- **Action**: Use **Basic Memory MCP** to log development
- **Log template**:

```
## Task Development #[ID]
**Date**: [Current date] (use `date "+%Y-%m-%d_%H:%M:%S"` in shell to get timestamp)
**Title**: [Task title]

### Summary
- Status: Completed
- Estimated time: [time]
- Time spent: [time]
- Approach used: [brief description]

### Implementation
- Modified files: [list]
- Tests added: [yes/no - details]
- Dependencies: [if applicable]

### Observations
- [Important points for future reference]
- [Technical decisions made]
- [Possible future improvements]
```

Once it is stored in Basic Memory, use its MCP to write the development log in the memories folder at docs/memories/development-logs, using the pattern `task-[ID]-[title].md`

### 10. 💾 COMMIT AND PUSH

- Commit only when QA is 100% clean
- Always use `git add --all`
- **Commit message pattern**:

```
type(scope): description

- Implements feature X as per task #ID
- Resolves dependencies Y and Z
- Adds tests for scenarios A, B, C

Closes #TaskID
```

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

- Push it to the feature branch

### 11. ⛄ OPENING THE PULL REQUEST

Use the Github CLI to open a PR with a comprehensive and accurate description of the implementation.

### 12. 📢 COMPLETION NOTIFICATION

- **Action**: Notify about task completion
- **Notification format**:

```
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
- [ ] Incremental commits being made
- [ ] Tests being written as needed
- [ ] Clean and well-structured code

### ✅ Before Commit

- [ ] Implementation complete as per task
- [ ] QA executed and 100% clean
- [ ] Tests passing
- [ ] Code reviewed

### ✅ After Completion

- [ ] Status updated to `done`
- [ ] Log recorded in Basic Memory MCP
- [ ] Completion notification sent
- [ ] Commit made with appropriate message

---

## 🚫 WHAT NEVER TO DO

- ❌ Skip QA checks
- ❌ Commit with quality issues
- ❌ Assume unspecified requirements
- ❌ Overengineer solutions
- ❌ Proceed without updating task statuses
- ❌ Forget to record development logs
- ❌ Implement without a deepthink plan

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
