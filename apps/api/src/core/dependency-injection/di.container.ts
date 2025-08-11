// Reflection metadata is needed for decorator metadata
import 'reflect-metadata';
import { INJECT_METADATA_KEY } from './di.constants.js';

// Type for constructor function
// biome-ignore lint/suspicious/noExplicitAny: Type for constructor function
type Constructor<T = any> = new (...args: any[]) => T;

// biome-ignore lint/suspicious/noExplicitAny: Type for registration
type Registration<T = any> =
  | {
      type: 'class';
      value: Constructor<T>;
      singleton?: boolean;
    }
  | {
      type: 'instance';
      value: T;
      singleton?: boolean;
    };

/**
 * IoC Container class
 */
export class Container {
  private static instance: Container;
  private registry = new Map<string, Registration>();
  private singletons: Map<string, Registration> = new Map();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Initialize container with class constructors
  initialize(args: any[]) {
    args.forEach((arg) => {
      if (
        typeof arg !== 'function' ||
        !arg.prototype ||
        !(arg.prototype.constructor === arg)
      ) {
        throw new Error(`Argument "${arg}" is not a valid class constructor`);
      }
    });
  }

  /**
   * Register a class implementation for a token
   */
  registerClass<T>(
    token: string,
    classDefinition: Constructor<T>,
    singleton?: boolean
  ): void {
    if (this.registry.has(token)) {
      throw new Error(`Instance with key '${token}' already exists.`);
    }

    this.registry.set(token, {
      type: 'class',
      value: classDefinition,
      singleton,
    });
  }

  registerInstance<T>(token: string, instance: T, singleton?: boolean): void {
    if (this.registry.has(token)) {
      throw new Error(`Instance with key '${token}' already exists.`);
    }
    this.registry.set(token, { type: 'instance', value: instance, singleton });
  }

  /**
   * Get an instance of the requested token
   */
  resolve<T>(token: string): T {
    const registration = this.registry.get(token);

    if (!registration) {
      throw new Error(`No registration found for token: ${token}`);
    }

    if (registration.singleton && this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    if (registration.type === 'instance') {
      return registration.value as T;
    }

    const ClassDefinition = registration.value;

    // Get the injected parameters metadata
    const injectMetadata: string[] =
      Reflect.getMetadata(INJECT_METADATA_KEY, ClassDefinition) || [];

    // Resolve each parameter
    const params = injectMetadata.map((paramToken) => this.resolve(paramToken));

    const instance = new ClassDefinition(...params);

    if (registration.singleton) {
      this.singletons.set(token, instance);
    }

    return instance;
  }
}
