const supportedAuthProviderIds = ['google', 'facebook', 'github', 'apple', 'x'] as const;

export const placeholderAuthProviderIds = ['facebook', 'github', 'apple', 'x'] as const;

export type AuthProviderId = (typeof supportedAuthProviderIds)[number];

export type AuthProviderAvailability = {
  google: boolean;
};

export const authProviderIcons: Record<AuthProviderId, string> = {
  apple: '',
  facebook: 'f',
  github: 'G',
  google: 'G',
  x: 'X'
};
