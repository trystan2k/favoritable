import { INJECT_METADATA_KEY } from "./di.constants";
import { Container } from "./di.container";

type ServiceOptions = {
  name: string;
  singleton?: boolean;
}

/**
 * Service decorator to mark a class as injectable
 * @param options Configuration options for the service
 */
export const Service = (options?: ServiceOptions) => {
  return function <T extends { new(...args: any[]): any }>(constructor: T) {
    const name = options?.name || constructor.name;
    const container = Container.getInstance();

    // Register the class constructor with the container
    container.registerClass(name, constructor, options?.singleton);

    return constructor;
  };
}

/**
 * Decorator to mark constructor parameters for injection
 */
export const Inject = (token: string) => {
  return function(target: any, _propertyKey: string | undefined, parameterIndex: number) {
    const existingInjectedParams: string[] = Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];

    // Ensure the array has enough elements
    while (existingInjectedParams.length <= parameterIndex) {
      existingInjectedParams.push('');
    }

    // Set the token at the parameter index
    existingInjectedParams[parameterIndex] = token;

    Reflect.defineMetadata(INJECT_METADATA_KEY, existingInjectedParams, target);
  };
}
