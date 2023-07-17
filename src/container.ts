/**
 * @module container
 */

type Class<T> = {
    new (...args: any[]): T;
};
type Instance<T> = T;

interface Config<T> {
    type?: Class<T>;
    instance?: Instance<T>;
    singleton?: boolean;
}

/**
 * @desc Manages creation of objects/instances by mapping interfaces/abstractions to
 * specific implementations.
 */
export class Container {
    private registry: Map<string, Config<any>> = new Map<string, Config<any>>();

    /**
     * @desc Registers a new dependency to a class which will get instantiated
     * when the dependency is resolved.
     * @param {String} name
     * @param {Function} type
     * @param {Object} [options]
     * @param {Boolean} [options.singleton=false]
     * @returns {Object}
     */
    public register<T>(
        name: string,
        type: Class<T>,
        options: { singleton: boolean } = { singleton: false }
    ) {
        if (this.registry.has(name)) {
            throw Error(`Already exists in registry: ${name}`);
        }

        const { singleton } = options;

        const config: Config<T> = {
            type,
            singleton,
        };

        this.registry.set(name, config);

        return config;
    }

    /**
     * @desc Registers a new dependency to an instance/object.
     * @param {String} name
     * @param {Object} instance
     * @returns {Object}
     */
    public registerInstance<T>(name: string, instance: Instance<T>) {
        if (this.registry.has(name)) {
            throw Error(`Already exists in registry: ${name}`);
        }

        const config: Config<T> = {
            instance,
        };

        this.registry.set(name, config);

        return config;
    }

    /**
     * @desc Resolves a dependency.
     * @param {String} name
     * @returns {*}
     */
    public get<T>(name: string): T {
        if (this.registry.has(name) === false) {
            throw Error(`Does not exist in registry: ${name}`);
        }

        const dependency = this.registry.get(name);

        if (dependency) {
            if (typeof dependency.instance !== 'undefined') {
                return dependency.instance;
            }

            const { type, singleton } = dependency;

            if (singleton) {
                // creating instance only once
                if (typeof type !== 'undefined') {
                    dependency.instance = new type();
                }

                if (typeof dependency.instance !== 'undefined') {
                    return dependency.instance;
                }
            } else {
                // creating instance
                if (typeof type !== 'undefined') {
                    return new type();
                }
            }
        }

        throw Error(`Type and instance not defined: ${name}`);
    }
}
