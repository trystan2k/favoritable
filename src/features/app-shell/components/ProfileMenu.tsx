import { Popover } from '@base-ui/react/popover';
import type { ComponentPropsWithoutRef } from 'react';
import { useCallback, useMemo } from 'react';

import styles from './ProfileMenu.module.css';

type ProfileMenuProps = {
  isSigningOut: boolean;
  onSignOut: () => Promise<void>;
  userEmail: string;
  userName: string;
};

function getInitials(userName: string) {
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'FV';
}

export function ProfileMenu({ isSigningOut, onSignOut, userEmail, userName }: ProfileMenuProps) {
  const initials = useMemo(() => getInitials(userName), [userName]);
  const triggerLabel = useMemo(() => {
    const identity = userName ? `${userName} (${userEmail})` : userEmail;

    return `Open account menu for ${identity}`;
  }, [userEmail, userName]);
  const renderTrigger = useCallback(
    (props: ComponentPropsWithoutRef<'button'>) => (
      <button {...props} type="button">
        <span aria-hidden="true" className={styles.avatar}>
          {initials}
        </span>
        <span className={styles.identity}>
          <span className={styles.name}>{userName}</span>
          <span className={styles.email}>{userEmail}</span>
        </span>
      </button>
    ),
    [initials, userEmail, userName]
  );

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={triggerLabel}
        className={styles.trigger}
        render={renderTrigger}
      />
      <Popover.Portal>
        <Popover.Positioner align="end" side="bottom" sideOffset={12}>
          <Popover.Popup className={styles.popup}>
            <div className={styles.panel}>
              <p className={styles.kicker}>Signed in</p>
              <p className={styles.menuName}>{userName}</p>
              <p className={styles.menuEmail}>{userEmail}</p>
              <button
                className={styles.action}
                disabled={isSigningOut}
                onClick={onSignOut}
                type="button"
              >
                {isSigningOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
