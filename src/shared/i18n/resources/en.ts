export const en = {
  appShell: {
    header: {
      body: 'Theme persistence, profile actions, quick add, and auth redirects stay live.',
      caption: 'Protected library with Better Auth session',
      eyebrow: 'Library shell',
      title: 'Protected bookmark library'
    },
    localeSaveError: 'Could not save language. Restored previous language.',
    sidebar: {
      activeSection: 'Library',
      collections: 'Collections later',
      eyebrow: 'Protected route',
      footnote: 'Minimal library now live. Collections, settings, and polish land later.',
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
  bookmarks: {
    library: {
      actions: {
        add: 'Add bookmark'
      },
      body: 'Your newest saved links land here first.',
      empty: {
        body: 'Save your first bookmark to start building your library.',
        title: 'No bookmarks saved yet'
      },
      eyebrow: 'Library',
      heading: 'Your bookmarks',
      linkOpensInNewTab: 'opens in a new tab'
    },
    quickAdd: {
      actions: {
        cancel: 'Back to library',
        save: 'Save bookmark',
        saving: 'Saving…'
      },
      body: 'Paste a URL, then adjust the title or description if you want.',
      errors: {
        duplicateUrl: 'This URL is already saved in your library.',
        genericSave: 'Could not save bookmark. Try again.'
      },
      eyebrow: 'Quick add',
      fields: {
        description: {
          label: 'Description',
          placeholder: 'Optional note about this bookmark'
        },
        title: {
          hint: 'Leave blank to use the URL hostname and path.',
          label: 'Title',
          placeholder: 'Optional title override'
        },
        url: {
          label: 'URL',
          placeholder: 'https://example.com/article'
        }
      },
      heading: 'Save a bookmark',
      validation: {
        description: {
          invalid: 'Description must be a string.',
          tooLong: 'Description must be 4096 characters or fewer.'
        },
        invalidInput: 'Invalid bookmark input.',
        title: {
          invalid: 'Title must be a string.',
          tooLong: 'Title must be 512 characters or fewer.'
        },
        url: {
          invalid: 'Enter a valid bookmark URL.',
          tooLong: 'Bookmark URL must be 2048 characters or fewer.'
        }
      }
    }
  },
  authError: {
    actions: {
      login: 'Go to login'
    },
    code: 'Error',
    description: 'Something went wrong during authentication. Please try again.',
    title: 'Authentication error'
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
