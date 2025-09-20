export const cx = (...args: unknown[]) => {
  return args
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ');
};
