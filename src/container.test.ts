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

        container.register<Ball>(Volleyball.name, Volleyball, {
            singleton: true,
        });

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

    test('should resolve dependencies of a dependency', () => {
        interface Ilogger {}
        interface Ball {}
        class Volleyball implements Ball {
            public logger: Ilogger;

            public constructor(logger) {
                this.logger = logger;
            }
        }

        class Logger implements Ilogger {}

        const dependencies = ['Logger'];

        container.register<Ilogger>('Logger', Logger);

        container.register<Ball>('Volleyball', Volleyball, { dependencies });

        const volleyball = container.get<Volleyball>('Volleyball');

        expect(volleyball.logger).toBeInstanceOf(Logger);
    });

    test('should resolve singleton dependencies of a dependency', () => {
        interface Ilogger {}
        interface Ball {}
        class Volleyball implements Ball {
            public logger: Ilogger;

            public constructor(logger) {
                this.logger = logger;
            }
        }

        class Logger implements Ilogger {}

        const dependencies = ['Logger'];

        container.register<Ilogger>('Logger', Logger, { singleton: true });

        container.register<Ball>('Volleyball', Volleyball, { dependencies });

        const volleyball = container.get<Volleyball>('Volleyball');

        expect(volleyball.logger).toBeInstanceOf(Logger);
    });

    test('should resolve arbitrary depths of dependencies of a dependency', () => {
        interface Ilogger {}
        interface Ball {
            net: INet;
        }
        interface INet {
            logger: Ilogger;
        }
        class Volleyball implements Ball {
            public net: INet;

            public constructor(net: INet) {
                this.net = net;
            }
        }

        class Net implements INet {
            public logger: Ilogger;

            public constructor(logger: Ilogger) {
                this.logger = logger;
            }
        }

        class Logger implements Ilogger {
            public constructor() {}
        }

        container.register<Ilogger>('Logger', Logger);

        container.register<INet>('Net', Net, {
            dependencies: ['Logger'],
        });

        container.register<Ball>('Volleyball', Volleyball, {
            dependencies: ['Net'],
        });

        const volleyball = container.get<Volleyball>('Volleyball');

        expect(volleyball.net).toBeInstanceOf(Net);
        expect(volleyball.net.logger).toBeInstanceOf(Logger);
    });

    test('should not resolve circular dependency', () => {
        interface Ball {
            net: INet;
        }
        interface INet {
            ball: Ball;
        }
        class Volleyball implements Ball {
            public net: INet;

            public constructor(net: INet) {
                this.net = net;
            }
        }

        class Net implements INet {
            public ball: Ball;

            public constructor(volleyball: Ball) {
                this.ball = volleyball;
            }
        }

        container.register<INet>('Net', Net, {
            dependencies: ['Volleyball'],
        });

        expect(() => {
            container.register<Ball>('Volleyball', Volleyball, {
                dependencies: ['Net'],
            });
        }).toThrow('Circular dependency');
    });

    test('should not resolve circular dependency with more depth', () => {
        interface Ball {
            net: INet;
        }
        interface INet {
            antenna: Antenna;
        }
        class Volleyball implements Ball {
            public net: INet;

            public constructor(net: INet) {
                this.net = net;
            }
        }

        class Net implements INet {
            public antenna: Antenna;

            public constructor(antenna: Antenna) {
                this.antenna = antenna;
            }
        }

        class Antenna {
            public ball: Ball;

            public constructor(volleyball: Ball) {
                this.ball = volleyball;
            }
        }

        container.register<Antenna>('Antenna', Antenna, {
            dependencies: ['Volleyball'],
        });

        container.register<INet>('Net', Net, {
            dependencies: ['Antenna'],
        });

        expect(() => {
            container.register<Ball>('Volleyball', Volleyball, {
                dependencies: ['Net'],
            });
        }).toThrow('Circular dependency');
    });
});
