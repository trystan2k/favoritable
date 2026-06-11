import { createFileRoute } from '@tanstack/react-router';

import { HomePage } from '@/components/home_page';

export const Route = createFileRoute('/')({ component: HomePage });
