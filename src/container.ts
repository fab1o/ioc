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
    singleton: boolean;
    dependencies: Array<string>;
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
     * @param {Array<String>} [options.dependencies=[]]
     * @returns {Object}
     */
    public register<T>(
        name: string,
        type: Class<T>,
        options: { singleton?: boolean; dependencies?: Array<string> } = {
            singleton: false,
            dependencies: [],
        }
    ) {
        if (this.registry.has(name)) {
            throw Error(`Already exists in registry: ${name}`);
        }

        const { singleton = false, dependencies = [] } = options;

        const isCirular = this.checkDependencies(name, dependencies);

        if (isCirular) {
            throw Error('Circular dependency');
        }

        const config: Config<T> = {
            type,
            singleton,
            dependencies,
        };

        this.registry.set(name, config);

        return config;
    }

    private checkDependencies(parentDep, dependencies: Array<string>) {
        for (const name of dependencies) {
            const dependency = this.registry.get(name);

            if (dependency) {
                const isCircular = dependency.dependencies.includes(parentDep);

                if (isCircular) {
                    return true;
                }

                return this.checkDependencies(
                    parentDep,
                    dependency.dependencies
                );
            }

            return false;
        }
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
            singleton: false,
            dependencies: [],
        };

        this.registry.set(name, config);

        return config;
    }

    private getDependencies<T>(dependency: Config<T>) {
        return dependency.dependencies.map((dep) => this.get(dep));
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
                    const dependencies = this.getDependencies<T>(dependency);
                    dependency.instance = new type(...dependencies);
                }

                if (typeof dependency.instance !== 'undefined') {
                    return dependency.instance;
                }
            } else {
                // creating instance
                if (typeof type !== 'undefined') {
                    const dependencies = this.getDependencies<T>(dependency);
                    return new type(...dependencies);
                }
            }
        }

        throw Error(`Type and instance not defined: ${name}`);
    }
}
