import { Container } from './container';

describe('Container', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    test('should not get when it does not exist', () => {
        const name = 'dependency';

        expect(() => container.get(name)).toThrow(
            `Does not exist in registry: ${name}`
        );
    });

    test('should register a singleton', () => {
        interface Ball {}
        class Volleyball implements Ball {}

        container.register<Ball>(Volleyball.name, Volleyball, { singleton: true });

        expect(container.get<Ball>(Volleyball.name)).toBe(
            container.get(Volleyball.name)
        );
    });

    test('should register a non-singleton', () => {
        interface Ball {}
        class Volleyball implements Ball {}

        container.register<Ball>(Volleyball.name, Volleyball);

        expect(container.get<Ball>(Volleyball.name)).not.toBe(
            container.get(Volleyball.name)
        );
    });

    test('should register a non-singleton', () => {
        interface Ball {}
        class Volleyball implements Ball {}
        class Football implements Ball {}

        container.register(Volleyball.name, Volleyball);
        container.register(Football.name, Football);

        expect(container.get(Volleyball.name)).not.toBe(
            container.get(Football.name)
        );

        expect(container.get(Volleyball.name)).toBeInstanceOf(Volleyball);
        expect(container.get(Football.name)).toBeInstanceOf(Football);
    });

    test('should register an object', () => {
        const name = 'logger';
        const logger = {
            logger: name,
        };

        container.registerInstance<typeof logger>(name, logger);

        expect(container.get(name)).toBe(logger);
        expect(container.get<typeof logger>(name).logger).toBe(name);
    });

    test('should not register more than once', () => {
        const name = 'object';

        container.registerInstance(name, new Object());

        expect(() => container.registerInstance(name, new Object())).toThrow(
            `Already exists in registry: ${name}`
        );
    });

    test('should throw error when instance is undefined', () => {
        const name = 'object';

        container.registerInstance(name, new Object()).instance = undefined;

        expect(() => container.get(name)).toThrow(
            `Type and instance not defined: ${name}`
        );
    });
});
