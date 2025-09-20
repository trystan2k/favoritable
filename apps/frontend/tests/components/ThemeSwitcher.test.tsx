import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createTestRouter, renderWithRouter } from '../test-utils';

describe('Theme Switcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render theme switcher button', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const themeSwitcher = screen.getByLabelText('Switch to dark theme');
    expect(themeSwitcher).toBeInTheDocument();
    expect(themeSwitcher.querySelector('svg')).toBeInTheDocument();
    expect(themeSwitcher.querySelector('.lucide-moon')).toBeInTheDocument();
  });

  test('should toggle theme when clicked', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const user = userEvent.setup();
    const themeSwitcher = screen.getByLabelText('Switch to dark theme');

    await user.click(themeSwitcher);

    // After clicking, the button should now show light mode icon and have updated aria-label
    expect(themeSwitcher).toHaveAttribute(
      'aria-label',
      'Switch to light theme'
    );
    expect(themeSwitcher.querySelector('svg')).toBeInTheDocument();
    expect(themeSwitcher.querySelector('.lucide-sun')).toBeInTheDocument();
  });

  test('should initialize with light theme by default', async () => {
    const router = createTestRouter(['/']);
    await renderWithRouter(router);

    const themeSwitcher = screen.getByLabelText('Switch to dark theme');
    expect(themeSwitcher.querySelector('svg')).toBeInTheDocument();
    // Moon icon should be present in light theme
    expect(themeSwitcher.querySelector('.lucide-moon')).toBeInTheDocument();
  });
});
