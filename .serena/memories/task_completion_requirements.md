# Task Completion Requirements

## Mandatory Quality Gates

### Before Starting Any Task
1. **Understanding**: Clearly understand the task requirements
2. **Planning**: Use deepthink to create a detailed action plan
3. **Status Update**: Mark task as `in-progress` in Task Master
4. **Initial QA**: Run `pnpm run complete-check` and ensure it passes

### Before Each Commit
1. **Code Review**: Request human review of changes
2. **Quality Check**: Run `pnpm run complete-check` - MUST pass 100%
3. **No Warnings**: Zero warnings or errors allowed
4. **Testing**: Ensure all tests pass with adequate coverage

### Quality Check Components
```bash
pnpm run complete-check  # Runs ALL of the following:
├── pnpm typecheck      # TypeScript compilation
├── pnpm check:fix      # Biome linting and formatting
├── pnpm knip           # Unused dependency check
├── pnpm test:coverage  # Test suite with coverage
└── pnpm build          # Production build verification
```

### Testing Requirements
- **Framework**: Vitest only
- **File Extensions**: `.test.ts` only (NEVER `.spec.ts`)
- **Test Location**: `tests/` directories only (NEVER `specs/`)
- **Frontend Testing**: Use `@testing-library/user-event` (NEVER `fireEvent`)
- **No act() Wrapping**: Don't manually wrap userEvent calls in act()
- **Coverage**: Must meet project thresholds (90% for API, configurable for frontend)

### Commit Standards
- **One commit per subtask** for better traceability
- **Descriptive messages**: Focus on what was done, not task IDs
- **No Agent References**: Never mention AI assistants in commits
- **Clean History**: Each commit should represent working, tested code

### Final Task Completion
1. **All Subtasks Done**: Every subtask committed and tested
2. **Final QA**: Run `pnpm run complete-check` one last time
3. **Documentation**: Log development in Basic Memory MCP
4. **Status Update**: Mark task as `done` in Task Master
5. **Physical Log**: Create development log file in `docs/memories/development-logs/`

## Absolute Prohibitions
- ❌ **NEVER** commit when QA fails (even with pre-existing errors)
- ❌ **NEVER** commit with warnings
- ❌ **NEVER** skip quality checks
- ❌ **NEVER** assume requirements
- ❌ **NEVER** create unnecessary files
- ❌ **NEVER** add comments unless requested
- ❌ **NEVER** commit secrets or keys

## Development Principles
- ✅ **Simplicity**: Always choose the simplest solution
- ✅ **Type Safety**: Maintain end-to-end type safety
- ✅ **Testing**: Write tests according to strategy
- ✅ **Clean Code**: Self-documenting, well-structured code
- ✅ **Consistency**: Follow existing patterns and conventions