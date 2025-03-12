import { mapErrors } from './errors.mapper.js';

export const handleServiceErrors = (entityName: string) => {
  return function actualDecorator<This, Args extends any[], Return>(target: (this: This, ...args: Args) => Promise<Return>, context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>) {
      async function replacementMethod(this: This, ...args: Args): Promise<Return> {
        try {
          const result = await target.call(this, ...args);
          return result;
        } catch (error) {
          // @ts-expect-error
          throw mapErrors(error, this[entityName]);
        }
      }

      return replacementMethod;
  }
}