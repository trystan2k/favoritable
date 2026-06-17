import { runCreateBookmarkMutation, type CreateBookmarkResult } from './create-bookmark-impl';

export type { CreateBookmarkResult } from './create-bookmark-impl';
export { runCreateBookmarkMutation };

export async function handleCreateBookmarkRequest(input: unknown): Promise<CreateBookmarkResult> {
  const { getRequest } = await import('@tanstack/react-start/server');
  const { requireAuthenticatedServerSession } =
    await import('@/features/auth/server/authenticated-middleware');
  const request = getRequest();
  const session = await requireAuthenticatedServerSession(request);

  return runCreateBookmarkMutation({
    input,
    userId: session.user.id
  });
}
