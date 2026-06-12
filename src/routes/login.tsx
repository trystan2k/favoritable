import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/auth/components/LoginPage';
import {
  getClientAuthProviderAvailability,
  getRouteAuthProviderAvailability
} from '@/features/auth/routes/login-route';
import { getRouteAuthSession, redirectIfLoggedIn } from '@/features/auth/routes/route-auth';

export { getClientAuthProviderAvailability };

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const routeAuthSessionPromise = getRouteAuthSession();
    const providerAvailabilityPromise = getRouteAuthProviderAvailability();

    await redirectIfLoggedIn(routeAuthSessionPromise);

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
