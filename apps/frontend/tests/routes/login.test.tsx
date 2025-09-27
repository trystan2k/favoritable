import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import styles from '../../src/routes/login/Login.module.css';
import { createTestRouter, renderWithRouter } from '../test-utils';

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'http://localhost:3000',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Login Route', () => {
  beforeEach(() => {
    mockLocation.href = '';
  });

  const renderLoginRoute = async () => {
    const router = createTestRouter(['/login']);
    await renderWithRouter(router);
  };

  it('renders login page with title', async () => {
    await renderLoginRoute();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sign in to Your Account' })
    ).toBeInTheDocument();
  });

  it('renders all five social login buttons', async () => {
    await renderLoginRoute();

    expect(
      screen.getByRole('button', { name: /Continue with Google/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue with Facebook/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue with GitHub/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue with Apple/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Continue with X/ })
    ).toBeInTheDocument();
  });

  it('redirects to correct Google OAuth endpoint when Google button is clicked', async () => {
    await renderLoginRoute();

    const googleButton = screen.getByRole('button', {
      name: /Continue with Google/,
    });
    await userEvent.click(googleButton);

    expect(mockLocation.href).toBe('/login/google');
  });

  it('redirects to correct Facebook OAuth endpoint when Facebook button is clicked', async () => {
    await renderLoginRoute();

    const facebookButton = screen.getByRole('button', {
      name: /Continue with Facebook/,
    });
    await userEvent.click(facebookButton);

    expect(mockLocation.href).toBe('/login/facebook');
  });

  it('redirects to correct GitHub OAuth endpoint when GitHub button is clicked', async () => {
    await renderLoginRoute();

    const githubButton = screen.getByRole('button', {
      name: /Continue with GitHub/,
    });
    await userEvent.click(githubButton);

    expect(mockLocation.href).toBe('/login/github');
  });

  it('redirects to correct Apple OAuth endpoint when Apple button is clicked', async () => {
    await renderLoginRoute();

    const appleButton = screen.getByRole('button', {
      name: /Continue with Apple/,
    });
    await userEvent.click(appleButton);

    expect(mockLocation.href).toBe('/login/apple');
  });

  it('redirects to correct Twitter/X OAuth endpoint when Twitter button is clicked', async () => {
    await renderLoginRoute();

    const twitterButton = screen.getByRole('button', {
      name: /Continue with X/,
    });
    await userEvent.click(twitterButton);

    expect(mockLocation.href).toBe('/login/twitter');
  });

  it('has accessible page structure', async () => {
    await renderLoginRoute();

    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Sign in to Your Account');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6); // 5 social buttons + 1 theme switcher

    const socialButtons = buttons.filter((button) =>
      button.textContent?.includes('Continue with')
    );
    expect(socialButtons).toHaveLength(5);

    socialButtons.forEach((button) => {
      expect(button).toBeVisible();
      expect(button).not.toHaveAttribute('aria-disabled');
    });

    const themeSwitcher = buttons.find(
      (button) =>
        button.getAttribute('aria-label')?.includes('Switch to') &&
        button.getAttribute('aria-label')?.includes('theme')
    );
    expect(themeSwitcher).toBeInTheDocument();
  });

  it('applies correct CSS classes to login container', async () => {
    await renderLoginRoute();

    const heading = screen.getByRole('heading', { level: 1 });
    // Navigate up the DOM: cardContent -> card -> container
    const cardContent = heading.parentElement;
    const card = cardContent?.parentElement;
    const container = card?.parentElement;
    expect(container).toBeTruthy();
    expect(container!).toHaveClass(styles.container || 'container');
  });

  it('renders terms and conditions text', async () => {
    await renderLoginRoute();

    expect(
      screen.getByText(/By signing in, you agree to our/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Terms of Service' })
    ).toHaveAttribute('href', '/terms');
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' })
    ).toHaveAttribute('href', '/privacy');
  });

  it('handles Enter key activation on Google button', async () => {
    await renderLoginRoute();

    const googleButton = screen.getByRole('button', {
      name: /Continue with Google/,
    });

    await act(async () => {
      googleButton.focus();
      await userEvent.keyboard('{Enter}');
    });

    expect(mockLocation.href).toBe('/login/google');
  });

  it('handles Space key activation on Facebook button', async () => {
    await renderLoginRoute();

    const facebookButton = screen.getByRole('button', {
      name: /Continue with Facebook/,
    });

    await act(async () => {
      facebookButton.focus();
      await userEvent.keyboard(' ');
    });

    expect(mockLocation.href).toBe('/login/facebook');
  });

  it('renders login layout with theme switcher in header', async () => {
    await renderLoginRoute();

    // The login layout should have a theme switcher in the header
    const themeSwitcher = screen.getByLabelText(/Switch to (dark|light) theme/);
    expect(themeSwitcher).toBeInTheDocument();
  });
});
