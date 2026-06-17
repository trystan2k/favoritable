export const es = {
  appShell: {
    header: {
      body: 'La persistencia del tema, las acciones del perfil, el agregado rápido y los redireccionamientos de autenticación siguen activos.',
      caption: 'Biblioteca protegida con sesión de Better Auth',
      eyebrow: 'Shell de biblioteca',
      title: 'Biblioteca protegida de marcadores'
    },
    localeSaveError: 'No se pudo guardar el idioma. Se restauró el idioma anterior.',
    sidebar: {
      activeSection: 'Biblioteca',
      collections: 'Colecciones después',
      eyebrow: 'Ruta protegida',
      footnote:
        'La biblioteca mínima ya está activa. Colecciones, ajustes y pulido llegan después.',
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
  bookmarks: {
    library: {
      actions: {
        add: 'Agregar marcador'
      },
      body: 'Tus enlaces guardados más recientes aparecen aquí primero.',
      empty: {
        body: 'Guarda tu primer marcador para empezar a construir tu biblioteca.',
        title: 'Aún no hay marcadores guardados'
      },
      eyebrow: 'Biblioteca',
      heading: 'Tus marcadores',
      linkOpensInNewTab: 'se abre en una pestaña nueva'
    },
    quickAdd: {
      actions: {
        cancel: 'Volver a la biblioteca',
        save: 'Guardar marcador',
        saving: 'Guardando…'
      },
      body: 'Pega una URL y luego ajusta el título o la descripción si quieres.',
      errors: {
        duplicateUrl: 'Esta URL ya está guardada en tu biblioteca.',
        genericSave: 'No se pudo guardar el marcador. Intenta de nuevo.'
      },
      eyebrow: 'Agregar rápido',
      fields: {
        description: {
          label: 'Descripción',
          placeholder: 'Nota opcional sobre este marcador'
        },
        title: {
          hint: 'Déjalo en blanco para usar el hostname y la ruta de la URL.',
          label: 'Título',
          placeholder: 'Reemplazo opcional del título'
        },
        url: {
          label: 'URL',
          placeholder: 'https://example.com/article'
        }
      },
      heading: 'Guardar un marcador',
      validation: {
        description: {
          invalid: 'La descripción debe ser una cadena.',
          tooLong: 'La descripción debe tener 4096 caracteres o menos.'
        },
        invalidInput: 'La entrada del marcador es inválida.',
        title: {
          invalid: 'El título debe ser una cadena.',
          tooLong: 'El título debe tener 512 caracteres o menos.'
        },
        url: {
          invalid: 'Ingresa una URL de marcador válida.',
          tooLong: 'La URL del marcador debe tener 2048 caracteres o menos.'
        }
      }
    }
  },
  authError: {
    actions: {
      login: 'Ir al acceso'
    },
    code: 'Error',
    description: 'Algo salió mal durante la autenticación. Intenta de nuevo.',
    title: 'Error de autenticación'
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
