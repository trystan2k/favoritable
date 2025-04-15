export const ClassErrorHandler = (mapErrors: (error: unknown, entity: string) => void) => {
  return function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        const methodNames = Object.getOwnPropertyNames(constructor.prototype);

        for (const methodName of methodNames) {
          // console.log('methodName', methodName)
          if (methodName !== 'constructor') {
            const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, methodName);
            if (descriptor && typeof descriptor.value === 'function') {
              const originalMethod = descriptor.value;
              Object.defineProperty(this, methodName, {
                value: async function (this: InstanceType<T>, ...args: Parameters<typeof originalMethod>) {
                  try {
                    const result = await originalMethod.apply(this, args);
                    return result;
                  } catch (error) {
                    throw mapErrors(error, constructor.name);
                  }
                },
                configurable: true,
                writable: true
              });
            }
          }
        }
      }
    };
  };
};
