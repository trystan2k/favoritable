import { fileHeader } from 'style-dictionary/utils';

// Configurable theme names for prefix normalization
const THEME_NAMES = ['light', 'dark'];

// Function to normalize theme prefixes in token paths
function normalizeThemePrefix(tokenPath) {
  const themePattern = new RegExp(`^theme-(${THEME_NAMES.join('|')})-`);
  return tokenPath.replace(themePattern, 'theme-');
}

// Reusable token reference replacement function
const replaceTokenReferences = (value) => {
  return value.replace(/\{([^}]+)\}/g, (_match, tokenPath) => {
    // Convert dot notation to kebab case and normalize theme prefixes
    const kebabTokenPath = tokenPath.replace(/\./g, '-');
    const cssVarName = normalizeThemePrefix(kebabTokenPath);
    return `var(--${cssVarName})`;
  });
};

// Reusable theme-agnostic name generator
const generateThemeAgnosticName = (token) => {
  // Remove theme name only at position 1 (where Style Dictionary places them for semantic tokens)
  return token.path
    .filter((segment, index) => !(index === 1 && THEME_NAMES.includes(segment)))
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
        const themeTokens = dictionary.allTokens.reduce(
          (acc, token) => {
            const themeName = THEME_NAMES.find((name) =>
              token.filePath.includes(`theme-${name}`)
            );
            if (themeName) {
              acc[`${themeName}Tokens`].push(token);
            }
            return acc;
          },
          Object.fromEntries(
            THEME_NAMES.map((themeName) => [`${themeName}Tokens`, []])
          )
        );

        // Generate CSS sections
        const generateTokenCSS = (tokens) =>
          tokens
            .map((token) => `  --${token.name}: ${token.value};`)
            .join('\n');

        const lightCSS = `:root[data-theme="light"] {\n${generateTokenCSS(themeTokens.lightTokens)}\n}`;
        const darkCSS = `:root[data-theme="dark"] {\n${generateTokenCSS(themeTokens.darkTokens)}\n}`;

        return `${[header, lightCSS, darkCSS].join('\n\n')}\n`;
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
