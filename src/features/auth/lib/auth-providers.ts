const supportedAuthProviderIds = ['google', 'facebook', 'github', 'apple', 'x'] as const;

export const placeholderAuthProviderIds = ['facebook', 'github', 'apple', 'x'] as const;

export type AuthProviderId = (typeof supportedAuthProviderIds)[number];

export type AuthProviderAvailability = {
  google: boolean;
};

export const authProviderCopy: Record<
  AuthProviderId,
  { icon: string; label: string; loadingLabel: string }
> = {
  apple: {
    icon: '',
    label: 'Continue with Apple',
    loadingLabel: 'Starting Apple sign-in…'
  },
  facebook: {
    icon: 'f',
    label: 'Continue with Facebook',
    loadingLabel: 'Starting Facebook sign-in…'
  },
  github: {
    icon: 'G',
    label: 'Continue with GitHub',
    loadingLabel: 'Starting GitHub sign-in…'
  },
  google: {
    icon: 'G',
    label: 'Continue with Google',
    loadingLabel: 'Starting Google sign-in…'
  },
  x: {
    icon: 'X',
    label: 'Continue with X',
    loadingLabel: 'Starting X sign-in…'
  }
};
