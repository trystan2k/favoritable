export const ptBr = {
  appShell: {
    header: {
      body: 'Persistência de tema, ações de perfil, adição rápida e redirecionamentos de autenticação seguem ativos.',
      caption: 'Biblioteca protegida com sessão do Better Auth',
      eyebrow: 'Shell da biblioteca',
      title: 'Biblioteca protegida de favoritos'
    },
    localeSaveError: 'Não foi possível salvar o idioma. Idioma anterior restaurado.',
    sidebar: {
      activeSection: 'Biblioteca',
      collections: 'Coleções depois',
      eyebrow: 'Rota protegida',
      footnote: 'Biblioteca mínima agora está ativa. Coleções, ajustes e polimento chegam depois.',
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
  bookmarks: {
    library: {
      actions: {
        add: 'Adicionar favorito'
      },
      body: 'Seus links salvos mais recentes aparecem aqui primeiro.',
      empty: {
        body: 'Salve seu primeiro favorito para começar sua biblioteca.',
        title: 'Nenhum favorito salvo ainda'
      },
      eyebrow: 'Biblioteca',
      heading: 'Seus favoritos',
      linkOpensInNewTab: 'abre em uma nova aba'
    },
    quickAdd: {
      actions: {
        cancel: 'Voltar para a biblioteca',
        save: 'Salvar favorito',
        saving: 'Salvando…'
      },
      body: 'Cole uma URL e depois ajuste o título ou a descrição se quiser.',
      errors: {
        duplicateUrl: 'Esta URL já está salva na sua biblioteca.',
        genericSave: 'Não foi possível salvar o favorito. Tente de novo.'
      },
      eyebrow: 'Adição rápida',
      fields: {
        description: {
          label: 'Descrição',
          placeholder: 'Nota opcional sobre este favorito'
        },
        title: {
          hint: 'Deixe em branco para usar o hostname e o caminho da URL.',
          label: 'Título',
          placeholder: 'Sobrescrita opcional do título'
        },
        url: {
          label: 'URL',
          placeholder: 'https://example.com/article'
        }
      },
      heading: 'Salvar um favorito',
      validation: {
        description: {
          invalid: 'A descrição deve ser uma string.',
          tooLong: 'A descrição deve ter no máximo 4096 caracteres.'
        },
        invalidInput: 'A entrada do favorito é inválida.',
        title: {
          invalid: 'O título deve ser uma string.',
          tooLong: 'O título deve ter no máximo 512 caracteres.'
        },
        url: {
          invalid: 'Informe uma URL de favorito válida.',
          tooLong: 'A URL do favorito deve ter no máximo 2048 caracteres.'
        }
      }
    }
  },
  authError: {
    actions: {
      login: 'Ir para o login'
    },
    code: 'Erro',
    description: 'Algo deu errado durante a autenticação. Tente novamente.',
    title: 'Erro de autenticação'
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
