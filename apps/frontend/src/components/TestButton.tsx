import { Button } from 'react-aria-components';
import styles from './Button.module.css';

interface TestButtonProps {
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export function TestButton({ variant = 'solid', children }: TestButtonProps) {
  const buttonClasses = `${styles.button} ${styles[variant]}`;

  return <Button className={buttonClasses}>{children}</Button>;
}
