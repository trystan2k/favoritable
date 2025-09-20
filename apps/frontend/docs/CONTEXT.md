# Frontend application context

## 🎨 CSS MODULES CONVENTIONS

### Primary Styling Method

CSS Modules is the **primary and required** styling approach for all React components in this project. All component-specific styles must use CSS Modules to ensure proper scoping and maintainability.

### File Naming and Co-location Convention

- Each component must have its corresponding CSS Module file co-located in the same directory
- Naming pattern: `Component.tsx` → `Component.module.css`
- Example structure:
  ```
  src/components/
    Button.tsx
    Button.module.css
    ThemeSwitcher.tsx  
    ThemeSwitcher.module.css
  ```

### Import and Usage Pattern

```typescript
// Component.tsx
import styles from './Component.module.css';

export function Component() {
  return (
    <div className={styles.wrapper}>
      <button className={styles.button}>
        Click me
      </button>
    </div>
  );
}
```

### Design Token Usage (MANDATORY)

All CSS values in `.module.css` files **MUST** use design tokens from the Style Dictionary system:

```css
/* Component.module.css */
.button {
  /* ✅ CORRECT - Using design tokens */
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--semantic-colors-cta-primary-base);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  
  /* ❌ INCORRECT - Hardcoded values */
  /* padding: 8px 12px; */
  /* background-color: #f59e0b; */
}
```

### Available Design Token Categories

- **Spacing**: `var(--spacing-1)` through `var(--spacing-96)`
- **Colors**: 
  - Semantic: `var(--semantic-colors-*)`
  - Theme-aware: `var(--theme-color-*)`
- **Typography**: `var(--font-size-*)`, `var(--font-weight-*)`
- **Border Radius**: `var(--radius-*)`
- **Shadows**: `var(--shadow-*)`

### Global vs Component Styles

- **Component-specific styles**: Always use CSS Modules in component directories
- **Global styles**: Only in `src/styles/global.css` for:
  - Theme imports
  - Body/html base styles
  - CSS resets
- **Layout styles**: Use CSS Modules in `src/routes/Layout.module.css` for page layouts

### TypeScript Support

CSS Modules are properly typed. The build system generates type definitions automatically:

```typescript
// This works with full TypeScript support
import styles from './Component.module.css';
console.log(styles.button); // ✅ Type-safe access
```

### Testing CSS Modules

When testing components that use CSS Modules, import the styles in tests:

```typescript
// Component.test.tsx
import styles from '../../src/components/Component.module.css';

test('applies correct CSS class', () => {
  const element = screen.getByRole('button');
  expect(element).toHaveClass(styles.button || 'button');
});
```

### Build Configuration

CSS Modules are configured in `rsbuild.config.ts` with:
- Development: Human-readable class names (`Component_button__hash123`)
- Production: Minified class names for optimal bundle size
