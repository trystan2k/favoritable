import { Button } from '@radix-ui/themes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div style={{ padding: '1rem' }}>
      <h3>About Page</h3>
      <p>This is the about page demonstrating routing with TanStack Router.</p>
      <div style={{ marginTop: '1rem' }}>
        <Button variant='outline' size='3'>
          Large Outline Button
        </Button>
      </div>
    </div>
  );
}
