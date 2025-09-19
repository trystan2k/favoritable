import type { ButtonProps } from 'react-aria-components';
import { Button as AriaButton } from 'react-aria-components';
import styles from './Button.module.css';

type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';

interface CustomButtonProps extends ButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export function Button({
  variant = 'solid',
  className,
  children,
  ...props
}: CustomButtonProps) {
  const variantClass = styles[variant];
  const buttonClasses =
    `${styles.button} ${variantClass} ${className || ''}`.trim();

  return (
    <AriaButton className={buttonClasses} {...props}>
      {children}
    </AriaButton>
  );
}
