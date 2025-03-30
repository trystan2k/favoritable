const isObject = (object: unknown) =>
  !Array.isArray(object) && (typeof object === 'object') && object !== null;


export const removeEmptyObjects = <T extends Record<string, unknown>>(object: T) => {
  if (!isObject(object)) return object;

  let newObject = {} as T;
  Object.keys(object).forEach((key) => {
    if (object[key]) {
      newObject = { ...newObject, [key]: object[key] };
    }
  });
  return newObject;
};