import { createFileRoute } from '@tanstack/react-router';

import { ProtectedHomePage } from '@/features/app-shell/views/ProtectedHomePage';

export const Route = createFileRoute('/_protected/')({ component: ProtectedHomePage });
