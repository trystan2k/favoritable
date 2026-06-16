import { createFileRoute } from '@tanstack/react-router';

import { AuthErrorPage } from '@/features/auth-error/views/AuthErrorPage';

export const Route = createFileRoute('/auth-error')({
  component: AuthErrorPage
});
