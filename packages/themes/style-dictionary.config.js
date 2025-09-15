import fs from 'fs/promises';
import StyleDictionary from 'style-dictionary';

const colorTransform = (token) => {
  const baseColor = token.original.value;
  const opacity = token.original.opacity;

  if (baseColor.startsWith('{') && baseColor.endsWith('}')) {
    // Simple color reference
    const refPath = baseColor.slice(1, -1).replace(/\./g, '-');
    return `color-mix(in srgb, var(--${refPath}) ${opacity * 100}%, transparent)`;
  }

  // For direct color values, convert to rgba or use color-mix
  return `color-mix(in srgb, ${baseColor} ${opacity * 100}%, transparent)`;
};

const createConfig = (theme) => ({
  source: theme.sources,
  hooks: {
    transforms: {
      'color/css-with-opacity': {
        type: 'value',
        transitive: true,
        filter: (token) => {
          return token.type === 'color' && token.original.opacity !== undefined;
        },
        transform: colorTransform,
      },
    },
  },
  platforms: {
    css: {
      transforms: [
        'size/rem',
        'size/pxToRem',
        'color/css',
        'color/css-with-opacity',
      ],
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [
        {
          destination: `${theme.name}.css`,
          format: 'css/variables',
          options: {
            outputReferences: (token) => {
              // Don't output references for tokens with opacity - use the transformed value instead
              return !(
                token.type === 'color' && token.original.opacity !== undefined
              );
            },
            selector:
              theme.name === 'foundations'
                ? ':root'
                : `[data-theme="${theme.name}"]`,
          },
        },
      ],
    },
  },
});

const buildThemes = async () => {
  const themes = [
    {
      name: 'foundations',
      sources: ['src/foundations/**/*.json'],
    },
  ];

  try {
    const entries = await fs.readdir('src/themes', { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        themes.push({
          name: entry.name,
          sources: [`src/themes/${entry.name}/**/*.json`],
        });
      }
    }
  } catch (error) {
    throw new Error(`Error reading themes directory: ${error.message}`);
  }

  for (const theme of themes) {
    const sd = new StyleDictionary(createConfig(theme));
    await sd.buildAllPlatforms();
  }
};

export default buildThemes;

// Execute the build
buildThemes();
