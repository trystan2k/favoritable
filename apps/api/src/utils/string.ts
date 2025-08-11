export const cleanableString = (input = '') => {
  let value = input ?? '';

  const chain = {
    removeTabs() {
      value = value.replace(/\t/g, '');
      return chain;
    },
    removeLineBreaks() {
      value = value.replace(/\n/g, '');
      return chain;
    },
    removeCarriageReturns() {
      value = value.replace(/\r/g, '');
      return chain;
    },
    toLowerCase() {
      value = value.toLowerCase();
      return chain;
    },
    convertToSlug() {
      value = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      return chain;
    },
    getResult() {
      return value;
    },
  };

  return chain;
};
