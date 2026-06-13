import { Outlet, createFileRoute } from '@tanstack/react-router';

import { ProtectedAppShell } from '@/features/app-shell/views/ProtectedAppShell';
import { redirectIfLoggedOut } from '@/features/auth/routes/route-auth';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await redirectIfLoggedOut();

    return { session };
  },
  component: ProtectedLayout
});

function ProtectedLayout() {
  const { session } = Route.useRouteContext();

  return (
    <ProtectedAppShell userEmail={session.user.email} userName={session.user.name}>
      <Outlet />
    </ProtectedAppShell>
  );
}
