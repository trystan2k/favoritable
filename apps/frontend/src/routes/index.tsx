import { createFileRoute } from '@tanstack/react-router';
import { Button } from '../components/Button';
import styles from './Layout.module.css';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className={styles.page}>
      <h3 className={styles.pageTitleBrand}>Welcome Home!</h3>
      <div className={styles.card}>
        <p className={styles.cardText}>
          Design tokens are working! This card uses theme-aware CSS variables
          for spacing, colors, and typography that automatically switch between
          light and dark themes.
        </p>
        <div className={styles.buttonGroup}>
          <Button variant='solid'>Solid Button</Button>
          <Button variant='soft'>Soft Button</Button>
          <Button variant='outline'>Outline Button</Button>
          <Button variant='ghost'>Ghost Button</Button>
        </div>
      </div>
    </div>
  );
}
