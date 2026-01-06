import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SocialLoginButton } from '../../src/components/SocialLoginButton';
import styles from '../../src/components/SocialLoginButton.module.css';

const mockOnClick = vi.fn();

describe('SocialLoginButton', () => {
  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders Google login button with correct text and icon', () => {
    render(<SocialLoginButton provider='google' onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toHaveTextContent('Continue with Google');
    expect(screen.getByLabelText('Google')).toBeInTheDocument();
  });

  it('renders Facebook login button with correct text and icon', () => {
    render(<SocialLoginButton provider='facebook' onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toHaveTextContent('Continue with Facebook');
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
  });

  it('renders GitHub login button with correct text and icon', () => {
    render(<SocialLoginButton provider='github' onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toHaveTextContent('Continue with GitHub');
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
  });

  it('renders Apple login button with correct text and icon', () => {
    render(<SocialLoginButton provider='apple' onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toHaveTextContent('Continue with Apple');
    expect(screen.getByLabelText('Apple')).toBeInTheDocument();
  });

  it('renders Twitter/X login button with correct text and icon', () => {
    render(<SocialLoginButton provider='twitter' onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toHaveTextContent('Continue with X');
    expect(screen.getByLabelText('X (formerly Twitter)')).toBeInTheDocument();
  });

  it('calls onClick handler when button is clicked', async () => {
    const user = userEvent.setup();
    render(<SocialLoginButton provider='google' onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it('applies correct CSS classes based on provider', () => {
    const { rerender } = render(<SocialLoginButton provider='google' onClick={mockOnClick} />);

    let button = screen.getByRole('button');
    expect(button.className).toContain(styles.button);
    expect(button.className).toContain(styles.google);

    rerender(<SocialLoginButton provider='facebook' onClick={mockOnClick} />);
    button = screen.getByRole('button');
    expect(button.className).toContain(styles.button);
    expect(button.className).toContain(styles.facebook);

    rerender(<SocialLoginButton provider='github' onClick={mockOnClick} />);
    button = screen.getByRole('button');
    expect(button.className).toContain(styles.button);
    expect(button.className).toContain(styles.github);

    rerender(<SocialLoginButton provider='apple' onClick={mockOnClick} />);
    button = screen.getByRole('button');
    expect(button.className).toContain(styles.button);
    expect(button.className).toContain(styles.apple);

    rerender(<SocialLoginButton provider='twitter' onClick={mockOnClick} />);
    button = screen.getByRole('button');
    expect(button.className).toContain(styles.button);
    expect(button.className).toContain(styles.twitter);
  });

  it('button is accessible with proper ARIA attributes', () => {
    render(<SocialLoginButton provider='google' onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('renders with correct button text for all providers', () => {
    const providers = [
      { provider: 'google', expectedText: 'Continue with Google' },
      { provider: 'facebook', expectedText: 'Continue with Facebook' },
      { provider: 'github', expectedText: 'Continue with GitHub' },
      { provider: 'apple', expectedText: 'Continue with Apple' },
      { provider: 'twitter', expectedText: 'Continue with X' },
    ] as const;

    providers.forEach(({ provider, expectedText }) => {
      const { unmount } = render(<SocialLoginButton provider={provider} onClick={mockOnClick} />);
      expect(screen.getByRole('button')).toHaveTextContent(expectedText);
      unmount();
    });
  });

  it('keyboard navigation works correctly', async () => {
    const user = userEvent.setup();
    render(<SocialLoginButton provider='google' onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledOnce();

    mockOnClick.mockClear();
    await user.keyboard(' ');
    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it('handles multiple rapid clicks correctly', async () => {
    const user = userEvent.setup();
    render(<SocialLoginButton provider='google' onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });
});
