import { fileHeader } from 'style-dictionary/utils';

// Reusable token reference replacement function
const replaceTokenReferences = (value) => {
  return value.replace(/\{([^}]+)\}/g, (_match, tokenPath) => {
    // Convert dot notation to kebab case and normalize theme prefixes
    const cssVarName = tokenPath
      .replace(/\./g, '-')
      .replace(/^theme-(?:light|dark)-/, 'theme-');
    return `var(--${cssVarName})`;
  });
};

// Reusable theme-agnostic name generator
const generateThemeAgnosticName = (token) => {
  return token.path
    .filter(
      (segment, index) =>
        !(index === 1 && (segment === 'light' || segment === 'dark'))
    )
    .join('-');
};

export default {
  source: [
    'src/primitives/**/*.json',
    'src/semantic/**/*.json',
    'src/components/**/*.json',
  ],
  hooks: {
    transforms: {
      'css/variables-references': {
        type: 'value',
        transitive: true,
        filter: (token) =>
          typeof token.original.value === 'string' &&
          token.original.value.includes('{'),
        transform: (token) => replaceTokenReferences(token.original.value),
      },
      'name/theme-agnostic': {
        type: 'name',
        transform: generateThemeAgnosticName,
      },
    },
    formats: {
      'css/themes-combined': async ({ dictionary, file }) => {
        const header = await fileHeader({ file });

        // Split tokens by theme in one pass
        const { lightTokens, darkTokens } = dictionary.allTokens.reduce(
          (acc, token) => {
            if (token.filePath.includes('theme-light')) {
              acc.lightTokens.push(token);
            } else if (token.filePath.includes('theme-dark')) {
              acc.darkTokens.push(token);
            }
            return acc;
          },
          { lightTokens: [], darkTokens: [] }
        );

        // Generate CSS sections
        const generateTokenCSS = (tokens) =>
          tokens
            .map((token) => `  --${token.name}: ${token.value};`)
            .join('\n');

        const darkCSS = `:root[data-theme="dark"] {\n${generateTokenCSS(darkTokens)}\n}`;
        const lightCSS = `:root[data-theme="light"] {\n${generateTokenCSS(lightTokens)}\n}`;

        return [header, darkCSS, lightCSS].join('\n\n') + '\n';
      },
      'css/base-tokens': async ({ dictionary, file }) => {
        const header = await fileHeader({ file });
        const tokens = dictionary.allTokens
          .filter(
            (token) =>
              token.filePath.includes('primitives') ||
              token.filePath.includes('components')
          )
          .map((token) => `  --${token.name}: ${token.value};`)
          .join('\n');

        return `${header}\n\n:root {\n${tokens}\n}\n`;
      },
    },
  },
  platforms: {
    css: {
      transforms: [
        'attribute/cti',
        'name/theme-agnostic',
        'time/seconds',
        'size/rem',
        'color/css',
        'css/variables-references',
      ],
      buildPath: 'dist/',
      files: [
        {
          destination: 'base-tokens.css',
          format: 'css/base-tokens',
          filter: (token) =>
            token.filePath.includes('primitives') ||
            token.filePath.includes('components'),
        },
        {
          destination: 'themes.css',
          format: 'css/themes-combined',
          filter: (token) => token.filePath.includes('semantic'),
        },
      ],
    },
  },
};
