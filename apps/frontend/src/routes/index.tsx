import { createFileRoute } from '@tanstack/react-router';
import { Button } from 'react-aria-components';
import { TestButton } from '../components/TestButton';

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
          padding: 'var(--spacing-3)',
          backgroundColor: 'var(--theme-color-background-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--theme-color-border-primary)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--theme-color-text-secondary)',
            margin: '0 0 var(--spacing-3) 0',
          }}
        >
          Design tokens are working! This card uses theme-aware CSS variables
          for spacing, colors, and typography that automatically switch between
          light and dark themes.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-2)',
            alignItems: 'center',
          }}
        >
          <Button className='button-solid'>Solid Button</Button>
          <Button className='button-soft'>Soft Button</Button>
          <Button className='button-outline'>Outline Button</Button>
          <Button className='button-ghost'>Ghost Button</Button>
        </div>
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <h4
            style={{
              color: 'var(--theme-color-text-brand)',
              marginBottom: 'var(--spacing-2)',
            }}
          >
            CSS Modules Test:
          </h4>
          <TestButton>CSS Modules Button</TestButton>
        </div>
      </div>
    </div>
  );
}
