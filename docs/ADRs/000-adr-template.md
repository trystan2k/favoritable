# ADR-XXX: [Title]

**Date**: YYYY-MM-DD  
**Status**: [Proposed|Accepted|Deprecated|Superseded]  
**Deciders**: [List of people involved in the decision]  

## Context

[Describe the context and problem statement. Include:]
- [Business or technical problem that needs to be solved]
- [Current situation and constraints]
- [Requirements and goals]
- [Technical context (existing stack, architecture, etc.)]
- [Any driving factors or deadlines]

[Example format:]
```
The [project name] requires [specific need] that meets the following requirements:
- **Requirement 1**: Description
- **Requirement 2**: Description
- **Performance**: Specific performance needs
- **Compatibility**: Integration requirements
- **Developer Experience**: Workflow considerations

The project tech stack includes:
- Technology 1
- Technology 2
- Existing constraints

We need to [select/implement/decide] [what needs to be decided].
```

## Decision

### [Decision Category]: [Chosen Solution]

**Choice**: [Link to solution](URL) [brief description of what was chosen]

**Rationale**:
- **Key Benefit 1**: Explanation of why this matters
- **Key Benefit 2**: Explanation of advantage
- **Integration**: How it fits with existing tech
- **Performance**: Performance characteristics
- **Maintainability**: Long-term considerations
- **Community/Support**: Ecosystem and support considerations
- **Future-Proof**: Future considerations

## Architecture Overview

[Optional: Include a simple ASCII diagram showing how the decision fits into the overall architecture]

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Component A   │    │   New Solution   │    │   Component B   │
│                 │◄──►│   (Decision)     │◄──►│                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Integration   │    │   Dependencies   │    │   Outputs       │
│   Points        │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation Strategy

### Phase 1: [Phase Name]
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

### Phase 2: [Phase Name]
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

### Phase 3: [Phase Name]
1. [Step 1 description]
2. [Step 2 description]

## Considered Alternatives

### [Category] Alternatives

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **[Selected Option]** | [Benefits] | [Drawbacks] | ✅ **Selected** |
| **[Alternative 1]** | [Benefits] | [Drawbacks] | ❌ [Reason rejected] |
| **[Alternative 2]** | [Benefits] | [Drawbacks] | ❌ [Reason rejected] |
| **[Alternative 3]** | [Benefits] | [Drawbacks] | ❌ [Reason rejected] |

[Optional: Additional comparison sections if needed]

## Benefits

1. **[Benefit Category]**: Specific description of advantage
2. **[Performance]**: Quantifiable improvements
3. **[Developer Experience]**: Workflow improvements
4. **[Maintainability]**: Long-term advantages
5. **[Cost/Efficiency]**: Resource considerations
6. **[Integration]**: How it improves existing systems
7. **[Future-Proof]**: Strategic advantages

## Risk Assessment and Mitigations

### Risk: [Risk description]
- **Mitigation**: [How we address this risk]
- **Fallback**: [What we do if mitigation fails]

### Risk: [Risk description]
- **Mitigation**: [How we address this risk]
- **Fallback**: [What we do if mitigation fails]

### Risk: [Risk description]
- **Mitigation**: [How we address this risk]
- **Fallback**: [What we do if mitigation fails]

## [Optional: Performance/Comparison Data]

[Include if relevant - benchmarks, comparisons, metrics]

| Metric | [Selected] | [Alternative 1] | [Alternative 2] | Improvement |
|--------|------------|-----------------|-----------------|-------------|
| **[Metric 1]** | [Value] | [Value] | [Value] | [Improvement] |
| **[Metric 2]** | [Value] | [Value] | [Value] | [Improvement] |
| **[Metric 3]** | [Value] | [Value] | [Value] | [Improvement] |

*[Note about benchmark conditions]*

## References

- [Primary Documentation](URL)
- [Secondary Resource](URL)
- [Community Resource](URL)
- [Technical Specification](URL)
- [Migration Guide](URL)

---

**Next Steps**: [Clear action item linking to implementation tasks]