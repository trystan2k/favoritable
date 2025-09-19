import { createFileRoute } from '@tanstack/react-router';
import { Button } from '../components/Button';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div style={{ padding: 'var(--spacing-4)' }}>
      <h3 style={{ color: 'var(--theme-color-text-primary)' }}>About Page</h3>
      <p
        style={{
          color: 'var(--theme-color-text-secondary)',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        This is the about page demonstrating routing with TanStack Router.
      </p>
      <div style={{ marginTop: 'var(--spacing-4)' }}>
        <Button
          variant='outline'
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
          }}
        >
          Large Outline Button
        </Button>
      </div>
    </div>
  );
}
