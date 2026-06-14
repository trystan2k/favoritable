import { useTranslation } from 'react-i18next';

import { ProtectedAppShell } from '@/features/app-shell/views/ProtectedAppShell';

import { NotFoundContent } from '../components/NotFoundContent';
import styles from '../components/NotFoundContent.module.css';

type ProtectedNotFoundPageProps = {
  userEmail: string;
  userName: string;
};

export function ProtectedNotFoundPage({ userEmail, userName }: ProtectedNotFoundPageProps) {
  const { t } = useTranslation();

  return (
    <ProtectedAppShell userEmail={userEmail} userName={userName}>
      <div className={styles.protectedViewport}>
        <div className={styles.protectedFrame}>
          <NotFoundContent
            actionHref="/"
            actionLabel={t('notFound.actions.home')}
            headingLevel="h2"
          />
        </div>
      </div>
    </ProtectedAppShell>
  );
}
