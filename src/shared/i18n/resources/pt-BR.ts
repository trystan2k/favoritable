export const ptBr = {
  appShell: {
    header: {
      body: 'Persistência de tema, ações de perfil e redirecionamentos de autenticação seguem ativos.',
      caption: 'Shell protegida com sessão do Better Auth',
      eyebrow: 'Shell de tema',
      title: 'Shell protegida da biblioteca pronta'
    },
    localeSaveError: 'Não foi possível salvar o idioma. Idioma anterior restaurado.',
    sidebar: {
      activeSection: 'Shell da biblioteca',
      collections: 'Coleções depois',
      eyebrow: 'Rota protegida',
      footnote: 'Só chrome vazio do app. Fluxos de favoritos chegam em tarefas filhas futuras.',
      navLabel: 'Seções da shell',
      settings: 'Configurações depois'
    },
    signOutError: 'Falha ao sair. Tente de novo.',
    skipToMainContent: 'Pular para o conteúdo principal'
  },
  auth: {
    footer: {
      desktop: 'Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade',
      mobile: 'Ao entrar, você concorda com nossos Termos e Política de Privacidade'
    },
    googleOauthUnavailableButton: 'Google OAuth indisponível',
    googleOauthUnavailableMessage:
      'Google OAuth está indisponível. Adicione GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no servidor e autorize {{callbackPath}} no Google Cloud.',
    hero: {
      body: {
        desktop:
          'Salve, organize e redescubra suas páginas favoritas pela web. Sua biblioteca moderna de favoritos espera por você.',
        mobile: 'Salve, organize e redescubra suas páginas favoritas.'
      },
      footer: {
        desktop: '© {{year}} Favoritable. Todos os direitos reservados.',
        mobile: '© {{year}} Favoritable'
      },
      welcome: 'Boas-vindas'
    },
    loginShellHeading: 'Shell de login do Favoritable',
    panel: {
      body: {
        desktop: 'Entre na sua conta para continuar',
        mobile: 'Entre para continuar'
      }
    },
    providers: {
      apple: {
        label: 'Continuar com Apple',
        loadingLabel: 'Iniciando entrada com Apple…'
      },
      facebook: {
        label: 'Continuar com Facebook',
        loadingLabel: 'Iniciando entrada com Facebook…'
      },
      github: {
        label: 'Continuar com GitHub',
        loadingLabel: 'Iniciando entrada com GitHub…'
      },
      google: {
        label: 'Continuar com Google',
        loadingLabel: 'Iniciando entrada com Google…'
      },
      x: {
        label: 'Continuar com X',
        loadingLabel: 'Iniciando entrada com X…'
      }
    }
  },
  common: {
    language: 'Idioma',
    soon: 'Em breve'
  },
  home: {
    body: 'Google OAuth, sessões persistidas e acesso à shell protegida agora substituem a costura temporária de autenticação da FAV-21.',
    eyebrow: 'Shell vazia',
    heading: 'Base de autenticação pronta para recursos de favoritos',
    status: {
      protected: 'Protegida',
      session: 'Sessão',
      theme: 'Tema',
      themeValue: 'Alternância persistida em runtime'
    }
  },
  notFound: {
    actions: {
      home: 'Ir para o início',
      login: 'Ir para o login'
    },
    description: 'A página que você procura não existe ou foi movida.',
    title: 'Página não encontrada'
  },
  locale: {
    names: {
      en: 'English',
      es: 'Español',
      'pt-BR': 'Português (Brasil)'
    }
  },
  profileMenu: {
    openMenuForIdentity: 'Abrir menu da conta de {{identity}}',
    signedIn: 'Sessão iniciada',
    signOut: 'Sair',
    signingOut: 'Saindo…'
  },
  theme: {
    darkMode: 'Modo escuro'
  }
} as const;
