export const es = {
  appShell: {
    header: {
      body: 'La persistencia del tema, las acciones del perfil y los redireccionamientos de autenticación siguen activos.',
      caption: 'Shell protegida con sesión de Better Auth',
      eyebrow: 'Shell de tema',
      title: 'Shell protegida de la biblioteca lista'
    },
    localeSaveError: 'No se pudo guardar el idioma. Se restauró el idioma anterior.',
    sidebar: {
      activeSection: 'Shell de biblioteca',
      collections: 'Colecciones después',
      eyebrow: 'Ruta protegida',
      footnote:
        'Solo chrome vacío de la app. Los flujos de marcadores llegan en tareas hijas posteriores.',
      navLabel: 'Secciones de la shell',
      settings: 'Configuración después'
    },
    signOutError: 'Cerrar sesión falló. Intenta de nuevo.',
    skipToMainContent: 'Saltar al contenido principal'
  },
  auth: {
    footer: {
      desktop: 'Al iniciar sesión, aceptas nuestros Términos de servicio y Política de privacidad',
      mobile: 'Al iniciar sesión, aceptas nuestros Términos y Política de privacidad'
    },
    googleOauthUnavailableButton: 'Google OAuth no disponible',
    googleOauthUnavailableMessage:
      'Google OAuth no está disponible. Agrega GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el servidor y autoriza {{callbackPath}} en Google Cloud.',
    hero: {
      body: {
        desktop:
          'Guarda, organiza y redescubre tus páginas favoritas de toda la web. Tu biblioteca moderna de marcadores te espera.',
        mobile: 'Guarda, organiza y redescubre tus páginas favoritas.'
      },
      footer: {
        desktop: '© {{year}} Favoritable. Todos los derechos reservados.',
        mobile: '© {{year}} Favoritable'
      },
      welcome: 'Bienvenido'
    },
    loginShellHeading: 'Shell de inicio de sesión de Favoritable',
    panel: {
      body: {
        desktop: 'Inicia sesión en tu cuenta para continuar',
        mobile: 'Inicia sesión para continuar'
      }
    },
    providers: {
      apple: {
        label: 'Continuar con Apple',
        loadingLabel: 'Iniciando acceso con Apple…'
      },
      facebook: {
        label: 'Continuar con Facebook',
        loadingLabel: 'Iniciando acceso con Facebook…'
      },
      github: {
        label: 'Continuar con GitHub',
        loadingLabel: 'Iniciando acceso con GitHub…'
      },
      google: {
        label: 'Continuar con Google',
        loadingLabel: 'Iniciando acceso con Google…'
      },
      x: {
        label: 'Continuar con X',
        loadingLabel: 'Iniciando acceso con X…'
      }
    }
  },
  common: {
    language: 'Idioma',
    soon: 'Pronto'
  },
  home: {
    body: 'Google OAuth, las sesiones persistidas y el acceso a la shell protegida ahora reemplazan la costura temporal de autenticación de FAV-21.',
    eyebrow: 'Shell vacía',
    heading: 'Base de autenticación lista para funciones de marcadores',
    status: {
      protected: 'Protegida',
      session: 'Sesión',
      theme: 'Tema',
      themeValue: 'Interruptor persistido en tiempo de ejecución'
    }
  },
  notFound: {
    actions: {
      home: 'Ir al inicio',
      login: 'Ir al acceso'
    },
    description: 'La página que buscas no existe o fue movida.',
    title: 'Página no encontrada'
  },
  locale: {
    names: {
      en: 'English',
      es: 'Español',
      'pt-BR': 'Português (Brasil)'
    }
  },
  profileMenu: {
    openMenuForIdentity: 'Abrir menú de cuenta para {{identity}}',
    signedIn: 'Sesión iniciada',
    signOut: 'Cerrar sesión',
    signingOut: 'Cerrando sesión…'
  },
  theme: {
    darkMode: 'Modo oscuro'
  }
} as const;
