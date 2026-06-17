import { StrictMode, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { duplicateBookmarkUrlMessage } from '@/features/bookmarks/lib/bookmark-messages';
import {
  createBookmark,
  type CreateBookmarkResult
} from '@/features/bookmarks/server/create-bookmark';
import { QuickAddBookmarkPage } from '@/features/bookmarks/views/QuickAddBookmarkPage';
import { TestI18nProvider } from '@/test-support/TestI18nProvider';

const invalidateMock = vi.fn<() => Promise<void>>(async () => undefined);
const navigateMock = vi.fn<() => Promise<void>>(async () => undefined);

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');

  return {
    ...actual,
    Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => navigateMock,
    useRouter: () => ({
      invalidate: invalidateMock
    })
  };
});

vi.mock('@/features/bookmarks/server/create-bookmark', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/bookmarks/server/create-bookmark')
  >('@/features/bookmarks/server/create-bookmark');

  return {
    ...actual,
    createBookmark: vi.fn<(input: unknown) => Promise<CreateBookmarkResult>>()
  };
});

describe('QuickAddBookmarkPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateMock.mockImplementation(async () => undefined);
    navigateMock.mockImplementation(async () => undefined);
  });

  test('shows inline field errors when quick add fails', async () => {
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(async () => ({
      fieldErrors: {
        url: [duplicateBookmarkUrlMessage]
      },
      success: false as const
    }));

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/launch' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('This URL is already saved in your library.')).toBeDefined();
    });
  });

  test('clears stale field and form errors after input edits', async () => {
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>().mockResolvedValueOnce({
      fieldErrors: {
        url: [duplicateBookmarkUrlMessage]
      },
      formError: 'bookmarks.quickAdd.errors.submit',
      success: false
    });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/launch' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('This URL is already saved in your library.')).toBeDefined();
      expect(screen.getByText('bookmarks.quickAdd.errors.submit')).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/launch-updated' }
    });

    await waitFor(() => {
      expect(
        screen.queryByText('This URL is already saved in your library.')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('bookmarks.quickAdd.errors.submit')).not.toBeInTheDocument();
    });
  });

  test('submits values and runs success handler after save', async () => {
    const onSuccess = vi.fn<() => Promise<void>>(async () => undefined);
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(async () => ({
      bookmarkId: 'bookmark-1',
      success: true as const
    }));

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage onSuccess={onSuccess} submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/launch' }
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Favoritable Launch' }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Launch note.' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(submitBookmark).toHaveBeenCalledWith({
        description: 'Launch note.',
        title: 'Favoritable Launch',
        url: 'https://favoritable.app/articles/launch'
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  test('awaits route invalidation then navigates to the library after a successful save', async () => {
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(async () => ({
      bookmarkId: 'bookmark-1',
      success: true as const
    }));

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/launch' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(invalidateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
      expect(screen.getByRole('button', { name: 'Save bookmark' })).not.toBeDisabled();
    });
  });

  test('re-enables the form before default success navigation settles', async () => {
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(async () => ({
      bookmarkId: 'bookmark-1',
      success: true as const
    }));

    navigateMock.mockImplementation(() => new Promise<void>(() => undefined));

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/hanging-default-navigation' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
      expect(screen.getByRole('button', { name: 'Save bookmark' })).not.toBeDisabled();
      expect(screen.getByRole('link', { name: 'Back to library' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  test('re-enables the form before success transition settles', async () => {
    const onSuccess = vi.fn<() => Promise<void>>(() => new Promise<void>(() => undefined));
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(async () => ({
      bookmarkId: 'bookmark-1',
      success: true as const
    }));

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage onSuccess={onSuccess} submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/hanging-navigation' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Save bookmark' })).not.toBeDisabled();
      expect(screen.getByLabelText('URL')).not.toBeDisabled();
      expect(screen.getByRole('link', { name: 'Back to library' })).not.toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  test('keeps mounted guard active after effect cleanup reruns', async () => {
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(async () => ({
      bookmarkId: 'bookmark-1',
      success: true as const
    }));

    render(
      <StrictMode>
        <TestI18nProvider isAuthenticated serverLocale="en">
          <QuickAddBookmarkPage submitBookmark={submitBookmark} />
        </TestI18nProvider>
      </StrictMode>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/strict-mode-save' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
      expect(screen.getByRole('button', { name: 'Save bookmark' })).not.toBeDisabled();
    });
  });

  test('guards duplicate submits before saving state rerenders', async () => {
    let resolveSubmit!: (value: CreateBookmarkResult) => void;
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(
      () =>
        new Promise<CreateBookmarkResult>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/launch' }
    });

    const form = screen.getByRole('button', { name: 'Save bookmark' }).closest('form');

    fireEvent.submit(form!);
    fireEvent.submit(form!);

    expect(submitBookmark).toHaveBeenCalledTimes(1);

    resolveSubmit({
      bookmarkId: 'bookmark-1',
      success: true
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
      expect(invalidateMock).toHaveBeenCalledTimes(1);
    });
  });

  test('disables fields and cancel navigation while save is pending', async () => {
    let resolveSubmit!: (value: CreateBookmarkResult) => void;
    const submitBookmark = vi.fn<() => Promise<CreateBookmarkResult>>(
      () =>
        new Promise<CreateBookmarkResult>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage submitBookmark={submitBookmark} />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/pending' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    expect(screen.getByLabelText('URL')).toBeDisabled();
    expect(screen.getByLabelText('Title')).toBeDisabled();
    expect(screen.getByLabelText('Description')).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Back to library' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    fireEvent.click(screen.getByRole('link', { name: 'Back to library' }));

    expect(navigateMock).not.toHaveBeenCalled();

    resolveSubmit({
      fieldErrors: {
        url: [duplicateBookmarkUrlMessage]
      },
      success: false
    });

    await waitFor(() => {
      expect(screen.getByLabelText('URL')).not.toBeDisabled();
    });
  });

  test('default submit path calls createBookmark server fn with form values', async () => {
    vi.mocked(createBookmark).mockResolvedValueOnce({
      bookmarkId: 'bookmark-default',
      success: true
    });

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/default-submit' }
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Default Submit Test' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(createBookmark).toHaveBeenCalledWith({
        data: {
          description: '',
          title: 'Default Submit Test',
          url: 'https://favoritable.app/articles/default-submit'
        }
      });
      expect(invalidateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith({ to: '/' });
    });
  });

  test('default submit path redirects to login on unauthorized', async () => {
    vi.mocked(createBookmark).mockRejectedValueOnce(
      new Response(null, {
        status: 401,
        statusText: 'Unauthorized'
      })
    );

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/unauthorized' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(invalidateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith({ to: '/login' });
    });
  });

  test('default submit path shows form error when createBookmark throws', async () => {
    vi.mocked(createBookmark).mockRejectedValueOnce(new Error('Server error'));

    render(
      <TestI18nProvider isAuthenticated serverLocale="en">
        <QuickAddBookmarkPage />
      </TestI18nProvider>
    );

    fireEvent.change(screen.getByLabelText('URL'), {
      target: { value: 'https://favoritable.app/articles/error' }
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save bookmark' }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });
});
