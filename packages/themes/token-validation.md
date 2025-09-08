# Design Token Validation Rules

## Naming Conventions
- Use kebab-case for all token names
- Be descriptive and avoid abbreviations  
- Follow semantic hierarchy: `domain.category.property.modifier`

## Reference Guidelines
- Component tokens MUST reference semantic tokens
- Semantic tokens MUST reference primitive tokens
- Cross-references should use explicit paths: `{domain.category.token}`

## File Organization
- Group related tokens in logical files
- Keep primitive tokens separate from semantic/component tokens
- Use consistent folder structure across categories

## Value Constraints
- Use rem/em for scalable sizing
- Define color values in hex format for primitives
- Use semantic color names for context (primary, secondary, etc.)
- Maintain consistent spacing scale ratios

## Documentation Requirements
- Each token file should include purpose comment
- Document breaking changes in token structure
- Maintain migration guides for major reorganizations