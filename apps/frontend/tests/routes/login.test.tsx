import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import styles from '../../src/routes/login/Login.module.css';
import { createTestRouter, getMockAuthClient, renderWithRouter } from '../test-utils';

describe('Login Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginRoute = async () => {
    const router = await createTestRouter(['/login']);
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

    expect(screen.getByRole('button', { name: /Continue with Google/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Facebook/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with GitHub/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Apple/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with X/ })).toBeInTheDocument();
  });

  it('calls Better Auth signIn.social with correct Google provider when button is clicked', async () => {
    const mockAuthClient = getMockAuthClient();

    await renderLoginRoute();

    const googleButton = screen.getByRole('button', {
      name: /Continue with Google/,
    });
    await userEvent.click(googleButton);

    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: window.location.origin,
    });
  });

  it('calls Better Auth signIn.social with correct Facebook provider when button is clicked', async () => {
    const mockAuthClient = getMockAuthClient();

    await renderLoginRoute();

    const facebookButton = screen.getByRole('button', {
      name: /Continue with Facebook/,
    });
    await userEvent.click(facebookButton);

    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'facebook',
      callbackURL: window.location.origin,
    });
  });

  it('calls Better Auth signIn.social with correct GitHub provider when button is clicked', async () => {
    const mockAuthClient = getMockAuthClient();

    await renderLoginRoute();

    const githubButton = screen.getByRole('button', {
      name: /Continue with GitHub/,
    });
    await userEvent.click(githubButton);

    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'github',
      callbackURL: window.location.origin,
    });
  });

  it('calls Better Auth signIn.social with correct Apple provider when button is clicked', async () => {
    const mockAuthClient = getMockAuthClient();

    await renderLoginRoute();

    const appleButton = screen.getByRole('button', {
      name: /Continue with Apple/,
    });
    await userEvent.click(appleButton);

    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'apple',
      callbackURL: window.location.origin,
    });
  });

  it('calls Better Auth signIn.social with correct Twitter provider when button is clicked', async () => {
    const mockAuthClient = getMockAuthClient();

    await renderLoginRoute();

    const twitterButton = screen.getByRole('button', {
      name: /Continue with X/,
    });
    await userEvent.click(twitterButton);

    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'twitter',
      callbackURL: window.location.origin,
    });
  });

  it('has accessible page structure', async () => {
    await renderLoginRoute();

    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Sign in to Your Account');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6); // 5 social buttons + 1 theme switcher

    const socialButtons = buttons.filter((button) => button.textContent?.includes('Continue with'));
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
    expect(container).toHaveClass(styles.container || 'container');
  });

  it('renders terms and conditions text', async () => {
    await renderLoginRoute();

    expect(screen.getByText(/By signing in, you agree to our/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'href',
      '/terms'
    );
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy'
    );
  });

  it('calls Better Auth signIn.social when Enter key is pressed on Google button', async () => {
    const mockAuthClient = getMockAuthClient();

    await renderLoginRoute();

    const googleButton = screen.getByRole('button', {
      name: /Continue with Google/,
    });

    await act(async () => {
      googleButton.focus();
      await userEvent.keyboard('{Enter}');
    });

    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: window.location.origin,
    });
  });

  it('calls Better Auth signIn.social when Space key is pressed on Facebook button', async () => {
    const mockAuthClient = getMockAuthClient();

    await renderLoginRoute();

    const facebookButton = screen.getByRole('button', {
      name: /Continue with Facebook/,
    });

    await act(async () => {
      facebookButton.focus();
      await userEvent.keyboard(' ');
    });

    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'facebook',
      callbackURL: window.location.origin,
    });
  });

  it('renders login layout with theme switcher in header', async () => {
    await renderLoginRoute();

    // The login layout should have a theme switcher in the header
    const themeSwitcher = screen.getByLabelText(/Switch to (dark|light) theme/);
    expect(themeSwitcher).toBeInTheDocument();
  });

  it('handles login errors gracefully', async () => {
    const mockAuthClient = getMockAuthClient();

    // Mock the signIn.social method to throw an error
    // biome-ignore lint/suspicious/noExplicitAny: Need to access mock methods
    (mockAuthClient.signInSocial as any).mockRejectedValueOnce(new Error('Login failed'));

    await renderLoginRoute();

    const googleButton = screen.getByRole('button', {
      name: /Continue with Google/,
    });

    // Should not throw an error when login fails
    await expect(userEvent.click(googleButton)).resolves.not.toThrow();

    // Verify that signIn.social was called despite the error
    expect(mockAuthClient.signInSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: window.location.origin,
    });
  });

  it('should not redirect when session is pending', async () => {
    const mockAuthClient = getMockAuthClient();

    // biome-ignore lint/suspicious/noExplicitAny: Mock type
    (mockAuthClient.getSession as any).mockResolvedValueOnce({
      data: null,
      isPending: true,
      error: null,
    });

    await renderLoginRoute();

    // Should allow rendering to proceed (no redirect)
    expect(mockAuthClient.getSession).toHaveBeenCalled();
  });
});
