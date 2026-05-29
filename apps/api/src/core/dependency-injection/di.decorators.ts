import { INJECT_METADATA_KEY } from './di.constants.js';
import { Container } from './di.container.js';

type ServiceOptions = {
  name: string;
  singleton?: boolean;
};

type Constructor = new (...args: never[]) => unknown;

/**
 * Service decorator to mark a class as injectable
 * @param options Configuration options for the service
 */
export const Service = (options?: ServiceOptions) => {
  return <T extends Constructor>(ctor: T) => {
    const name = options?.name || ctor.name;
    const container = Container.getInstance();

    // Register the class constructor with the container
    container.registerClass(name, ctor, options?.singleton);

    return ctor;
  };
};

/**
 * Decorator to mark constructor parameters for injection
 */
export const Inject = (token: string) => {
  return (target: object, _propertyKey: string | undefined, parameterIndex: number) => {
    const existingInjectedParams: string[] = Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];

    // Ensure the array has enough elements
    while (existingInjectedParams.length <= parameterIndex) {
      existingInjectedParams.push('');
    }

    // Set the token at the parameter index
    existingInjectedParams[parameterIndex] = token;

    Reflect.defineMetadata(INJECT_METADATA_KEY, existingInjectedParams, target);
  };
};
