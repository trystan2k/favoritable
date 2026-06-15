import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/auth/components/LoginPage';
import {
  getClientAuthProviderAvailability,
  getRouteAuthProviderAvailability
} from '@/features/auth/routes/login-route';
import { getRouteContextAuthSession, redirectIfLoggedIn } from '@/features/auth/routes/route-auth';

export { getClientAuthProviderAvailability };

export const Route = createFileRoute('/login')({
  beforeLoad: async (options) => {
    const rootSession = getRouteContextAuthSession(options.context);
    const hasRootSession = rootSession !== undefined;
    const providerAvailabilityPromise = getRouteAuthProviderAvailability();

    if (hasRootSession) {
      await redirectIfLoggedIn(Promise.resolve(rootSession));
    } else {
      await redirectIfLoggedIn();
    }

    return {
      providerAvailability: await providerAvailabilityPromise
    };
  },
  component: LoginRoute
});

function LoginRoute() {
  const { providerAvailability } = Route.useRouteContext();

  return <LoginPage isGoogleAuthAvailable={providerAvailability.google} />;
}
