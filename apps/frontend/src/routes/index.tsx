import { Button } from '@radix-ui/themes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div style={{ padding: '1rem' }}>
      <h3>Welcome Home!</h3>
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <Button variant='solid'>Solid Button</Button>
        <Button variant='soft'>Soft Button</Button>
        <Button variant='outline'>Outline Button</Button>
        <Button variant='ghost'>Ghost Button</Button>
      </div>
    </div>
  );
}
