import { Outlet, createFileRoute } from '@tanstack/react-router';

import { ProtectedAppShell } from '@/features/app-shell/views/ProtectedAppShell';
import { getRouteContextAuthSession, redirectIfLoggedOut } from '@/features/auth/routes/route-auth';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async (options) => {
    const rootSession = getRouteContextAuthSession(options?.context);
    const session = await redirectIfLoggedOut(rootSession);

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
