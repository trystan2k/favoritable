import path from 'node:path';

const DEFAULT_DATABASE_URL = 'file:./data/favoritable.db';

const projectRootPath = process.cwd();

function splitFileUrl(url: string) {
  const fileUrlValue = url.slice('file:'.length);
  const match = /^(?<pathname>[^?#]*)(?<suffix>[?#].*)?$/u.exec(fileUrlValue);

  return {
    pathname: match?.groups?.pathname ?? fileUrlValue,
    suffix: match?.groups?.suffix ?? ''
  };
}

type DatabaseCredentials = {
  authToken?: string;
  url: string;
};

export function resolveDatabaseUrl(
  databaseUrl = process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL
) {
  const trimmedDatabaseUrl = databaseUrl.trim();

  if (!trimmedDatabaseUrl.startsWith('file:')) {
    return trimmedDatabaseUrl;
  }

  const { pathname, suffix } = splitFileUrl(trimmedDatabaseUrl);

  if (pathname.startsWith('//')) {
    return trimmedDatabaseUrl;
  }

  const resolvedPath = path.isAbsolute(pathname)
    ? pathname
    : path.resolve(projectRootPath, pathname);

  return `file:${resolvedPath}${suffix}`;
}

export function getDatabaseFilePath(databaseUrl: string) {
  const normalizedDatabaseUrl = resolveDatabaseUrl(databaseUrl);

  if (!normalizedDatabaseUrl.startsWith('file:')) {
    return null;
  }

  return splitFileUrl(normalizedDatabaseUrl).pathname;
}

export function resolveDatabaseCredentials(
  databaseUrl = process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL,
  databaseAuthToken = process.env.DATABASE_AUTH_TOKEN?.trim()
): DatabaseCredentials {
  const resolvedAuthToken = databaseAuthToken?.trim();

  return resolvedAuthToken
    ? {
        authToken: resolvedAuthToken,
        url: resolveDatabaseUrl(databaseUrl)
      }
    : {
        url: resolveDatabaseUrl(databaseUrl)
      };
}
