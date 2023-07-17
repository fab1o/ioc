# @fab1o/ioc

IoC container for TypeScript.

## Usage

```ts
import { Container } from '@fab1o/ioc';

const container = new Container();

interface Ball {}
class Volleyball implements Ball {}

container.register<Ball>('ball', Volleyball);

const ball = container.get<Ball>('ball');
const ball2 = container.get<Ball>('ball');

ball === ball2; // false
```

### Singleton

```ts
interface Ball {}
class Volleyball implements Ball {}

container.register<Ball>('ball', Volleyball, { singleton: true });

const ball = container.get<Ball>('ball');
const ball2 = container.get<Ball>('ball');

ball === ball2; // true
```
