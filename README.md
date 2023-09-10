# unique-callback [![npm version](https://img.shields.io/npm/v/unique-callback.svg?style=flat)](https://www.npmjs.com/package/unique-callback)

Drop-in replacement for [`faker.helpers.unique`](https://fakerjs.dev/api/helpers.html#unique). Generates a unique result using the results of the given method. Used unique entries will be stored internally and filtered from subsequent calls.

## Example

```js
import { faker } from "@faker-js/faker";
import unique from "unique-callback";

const entity = {
    firstName: 'Billy',
    lastName: 'Bob',
    email: unique(faker.internet.email)
}
```

## Inspiration

[`faker.helpers.unique`](https://fakerjs.dev/api/helpers.html#unique) got [deprecated](https://github.com/faker-js/faker/issues/1785) 😔
