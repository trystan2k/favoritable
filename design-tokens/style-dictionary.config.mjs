import { createPropertyFormatter, sortByReference } from 'style-dictionary/utils';

const lightSelector = ':root';
const darkSelector = ':root[data-theme="dark"]';
const themeTokenRoots = new Set(['color', 'component', 'gradient']);
const themedCssTransformGroup = [
  'attribute/cti',
  'name/favoritable-css',
  'time/seconds',
  'html/icon',
  'size/rem',
  'color/css',
  'asset/url',
  'fontFamily/css',
  'cubicBezier/css',
  'strokeStyle/css/shorthand',
  'border/css/shorthand',
  'typography/css/shorthand',
  'transition/css/shorthand',
  'shadow/css/shorthand'
];

function normalizeFilePath(filePath = '') {
  return filePath.replaceAll('\\', '/');
}

function matchesTokenDirectory(filePath, directoryPath) {
  const normalizedPath = normalizeFilePath(filePath);

  return (
    normalizedPath.includes(`/${directoryPath}/`) || normalizedPath.includes(`${directoryPath}/`)
  );
}

function isThemeDirectory(filePath, themeName) {
  return matchesTokenDirectory(filePath, `design-tokens/semantic/${themeName}`);
}

function shouldNamespaceThemeReference(referencePath) {
  if (referencePath.startsWith('color.palette.')) {
    return false;
  }

  const [rootSegment] = referencePath.split('.');

  return themeTokenRoots.has(rootSegment);
}

function rewriteThemeReferences(value, themeName) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\{([^}]+)\}/gu, (match, referencePath) => {
    if (!shouldNamespaceThemeReference(referencePath)) {
      return match;
    }

    return `{theme.${themeName}.${referencePath}}`;
  });
}

function rewriteThemeTokens(node, themeName) {
  if (Array.isArray(node)) {
    return node.map((item) => rewriteThemeTokens(item, themeName));
  }

  if (!node || typeof node !== 'object') {
    return node;
  }

  if (Object.hasOwn(node, 'value')) {
    const token = { ...node };

    if (Object.hasOwn(token, 'value')) {
      token.value = rewriteThemeReferences(token.value, themeName);
    }

    return token;
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, rewriteThemeTokens(value, themeName)])
  );
}

function parseTokenFile({ contents, filePath }) {
  const parsedTokens = JSON.parse(contents);

  if (isThemeDirectory(filePath, 'light')) {
    return {
      theme: {
        light: rewriteThemeTokens(parsedTokens, 'light')
      }
    };
  }

  if (isThemeDirectory(filePath, 'dark')) {
    return {
      theme: {
        dark: rewriteThemeTokens(parsedTokens, 'dark')
      }
    };
  }

  return parsedTokens;
}

function stripThemePath(pathSegments) {
  if (pathSegments[0] === 'theme' && (pathSegments[1] === 'light' || pathSegments[1] === 'dark')) {
    return pathSegments.slice(2);
  }

  return pathSegments;
}

function getTokenName(pathSegments) {
  if (pathSegments[0] === 'theme' && pathSegments[1] === 'light') {
    return ['theme-light', ...stripThemePath(pathSegments)].join('-');
  }

  if (pathSegments[0] === 'theme' && pathSegments[1] === 'dark') {
    return ['theme-dark', ...stripThemePath(pathSegments)].join('-');
  }

  return pathSegments.join('-');
}

function stripThemePrefix(line) {
  return line.replaceAll('theme-light-', '').replaceAll('theme-dark-', '');
}

function isLightToken(token) {
  return (
    matchesTokenDirectory(token.filePath, 'design-tokens/base') ||
    matchesTokenDirectory(token.filePath, 'design-tokens/semantic/global') ||
    matchesTokenDirectory(token.filePath, 'design-tokens/semantic/light')
  );
}

function isDarkToken(token) {
  return matchesTokenDirectory(token.filePath, 'design-tokens/semantic/dark');
}

function formatDeclarationLines(tokens, dictionary, outputReferences) {
  const formatProperty = createPropertyFormatter({
    dictionary,
    format: 'css',
    outputReferences
  });

  return [...tokens]
    .toSorted(sortByReference(dictionary))
    .map(formatProperty)
    .map(stripThemePrefix);
}

function buildCssBlock(selector, declarationLines) {
  if (declarationLines.length === 0) {
    return '';
  }

  return `${selector} {\n${declarationLines.join('\n')}\n}`;
}

export default {
  hooks: {
    parsers: {
      'favoritable-themed-json': {
        pattern: /\.tokens\.json$/u,
        parser: parseTokenFile
      }
    },
    transforms: {
      'name/favoritable-css': {
        type: 'name',
        transform: (token) => getTokenName(token.path)
      }
    },
    transformGroups: {
      'favoritable/css': themedCssTransformGroup
    },
    formats: {
      'favoritable/css-variables-themes': ({ dictionary }) => {
        const lightLines = formatDeclarationLines(
          dictionary.allTokens.filter(isLightToken),
          dictionary,
          true
        );
        const baseDeclarations = new Set(lightLines);
        const darkLines = formatDeclarationLines(
          dictionary.allTokens.filter(isDarkToken),
          dictionary,
          false
        ).filter((line) => !baseDeclarations.has(line));

        return [
          '/* Auto-generated by Style Dictionary. Do not edit directly. */',
          buildCssBlock(lightSelector, lightLines),
          buildCssBlock(darkSelector, darkLines)
        ]
          .filter(Boolean)
          .join('\n\n');
      }
    }
  },
  parsers: ['favoritable-themed-json'],
  source: [
    'design-tokens/base/**/*.tokens.json',
    'design-tokens/semantic/global/**/*.tokens.json',
    'design-tokens/semantic/light/**/*.tokens.json',
    'design-tokens/semantic/dark/**/*.tokens.json'
  ],
  platforms: {
    css: {
      transformGroup: 'favoritable/css',
      buildPath: 'design-tokens/dist/',
      files: [
        {
          destination: 'variables.css',
          format: 'favoritable/css-variables-themes'
        }
      ]
    }
  }
};
