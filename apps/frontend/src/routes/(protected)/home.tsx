import { createFileRoute } from '@tanstack/react-router';
import { Button } from 'react-aria-components';
import buttonSharedStyles from '../../shared-styles/Button.module.css';
import { cx } from '../../utils/cx';
import styles from './layout.module.css';

export const Route = createFileRoute('/(protected)/home')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={styles.page}>
      <h3 className={styles.pageTitleBrand}>Welcome Home!</h3>
      <div className={styles.card}>
        <p className={styles.cardText}>
          Design tokens are working! This card uses theme-aware CSS variables for spacing, colors,
          and typography that automatically switch between light and dark themes.
        </p>
        <div className={styles.buttonGroup}>
          <Button className={cx(buttonSharedStyles.button, buttonSharedStyles.solid)}>
            Solid Button
          </Button>
          <Button className={cx(buttonSharedStyles.button, buttonSharedStyles.soft)}>
            Soft Button
          </Button>
          <Button className={cx(buttonSharedStyles.button, buttonSharedStyles.outline)}>
            Outline Button
          </Button>
          <Button className={cx(buttonSharedStyles.button, buttonSharedStyles.ghost)}>
            Ghost Button
          </Button>
        </div>
      </div>
    </div>
  );
}
