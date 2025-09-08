import { Button } from '@radix-ui/themes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div style={{ padding: 'var(--spacing-4)' }}>
      <h3 style={{ color: 'var(--theme-color-text-brand)' }}>Welcome Home!</h3>
      <div
        style={{
          marginTop: 'var(--spacing-4)',
          padding: 'var(--size-spacing-3)',
          backgroundColor: 'var(--theme-color-background-card)',
          borderRadius: 'var(--size-border-radius-medium)',
          border: '1px solid var(--theme-color-border-primary)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--size-font-size-sm)',
            color: 'var(--theme-color-text-secondary)',
            margin: '0 0 var(--size-spacing-3) 0',
          }}
        >
          Design tokens are working! This card uses theme-aware CSS variables
          for spacing, colors, and typography that automatically switch between
          light and dark themes.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--size-spacing-2)',
            alignItems: 'center',
          }}
        >
          <Button variant='solid'>Solid Button</Button>
          <Button variant='soft'>Soft Button</Button>
          <Button variant='outline'>Outline Button</Button>
          <Button variant='ghost'>Ghost Button</Button>
        </div>
      </div>
    </div>
  );
}
