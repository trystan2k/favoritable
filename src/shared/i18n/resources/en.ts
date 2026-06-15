export const en = {
  appShell: {
    header: {
      body: 'Theme persistence, profile actions, and auth redirects stay live.',
      caption: 'Protected shell with Better Auth session',
      eyebrow: 'Theme shell',
      title: 'Protected library shell ready'
    },
    localeSaveError: 'Could not save language. Restored previous language.',
    sidebar: {
      activeSection: 'Library shell',
      collections: 'Collections later',
      eyebrow: 'Protected route',
      footnote: 'Empty app chrome only. Bookmark workflows land in later child tasks.',
      navLabel: 'Shell sections',
      settings: 'Settings later'
    },
    signOutError: 'Sign-out failed. Try again.',
    skipToMainContent: 'Skip to main content'
  },
  auth: {
    footer: {
      desktop: 'By signing in, you agree to our Terms of Service and Privacy Policy',
      mobile: 'By signing in, you agree to our Terms and Privacy Policy'
    },
    googleOauthUnavailableButton: 'Google OAuth unavailable',
    googleOauthUnavailableMessage:
      'Google OAuth is unavailable. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the server and authorize {{callbackPath}} in Google Cloud.',
    hero: {
      body: {
        desktop:
          'Save, organize, and rediscover your favorite pages from across the web. Your modern bookmark library awaits.',
        mobile: 'Save, organize, and rediscover your favorite pages.'
      },
      footer: {
        desktop: '© {{year}} Favoritable. All rights reserved.',
        mobile: '© {{year}} Favoritable'
      },
      welcome: 'Welcome'
    },
    loginShellHeading: 'Favoritable login shell',
    panel: {
      body: {
        desktop: 'Sign in to your account to continue',
        mobile: 'Sign in to continue'
      }
    },
    providers: {
      apple: {
        label: 'Continue with Apple',
        loadingLabel: 'Starting Apple sign-in…'
      },
      facebook: {
        label: 'Continue with Facebook',
        loadingLabel: 'Starting Facebook sign-in…'
      },
      github: {
        label: 'Continue with GitHub',
        loadingLabel: 'Starting GitHub sign-in…'
      },
      google: {
        label: 'Continue with Google',
        loadingLabel: 'Starting Google sign-in…'
      },
      x: {
        label: 'Continue with X',
        loadingLabel: 'Starting X sign-in…'
      }
    }
  },
  common: {
    language: 'Language',
    soon: 'Soon'
  },
  home: {
    body: 'Google OAuth, persisted sessions, and protected shell access now replace the placeholder auth seam from FAV-21.',
    eyebrow: 'Empty shell',
    heading: 'Auth foundation ready for bookmark features',
    status: {
      protected: 'Protected',
      session: 'Session',
      theme: 'Theme',
      themeValue: 'Persisted runtime toggle'
    }
  },
  notFound: {
    actions: {
      home: 'Go home',
      login: 'Go to login'
    },
    description: "The page you're looking for doesn't exist or has been moved.",
    title: 'Page not found'
  },
  locale: {
    names: {
      en: 'English',
      es: 'Español',
      'pt-BR': 'Português (Brasil)'
    }
  },
  profileMenu: {
    openMenuForIdentity: 'Open account menu for {{identity}}',
    signedIn: 'Signed in',
    signOut: 'Sign out',
    signingOut: 'Signing out…'
  },
  theme: {
    darkMode: 'Dark mode'
  }
} as const;
