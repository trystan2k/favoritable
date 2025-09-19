import { createFileRoute } from '@tanstack/react-router';
import { Button } from '../components/Button';
import styles from './Layout.module.css';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div className={styles.page}>
      <h3 className={styles.pageTitle}>About Page</h3>
      <p className={styles.pageText}>
        This is the about page demonstrating routing with TanStack Router.
      </p>
      <div className={styles.section}>
        <Button variant='outline' className={styles.largeButton}>
          Large Outline Button
        </Button>
      </div>
    </div>
  );
}
