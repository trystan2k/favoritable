import { createFileRoute } from '@tanstack/react-router';
import { Button } from 'react-aria-components';
import buttonSharedStyles from '../shared-styles/Button.module.css';
import { cx } from '../utils/cx';
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
        <Button
          className={cx(
            buttonSharedStyles.button,
            buttonSharedStyles.outline,
            styles.largeButton
          )}
        >
          Large Outline Button
        </Button>
      </div>
    </div>
  );
}
