[![Build Status](https://travis-ci.org/brunops/named-hooks.svg)](https://travis-ci.org/brunops/named-hooks)

#named-hooks

Allow hooks to be defined and invoked in order based on its names.

#Usage

By default, `named-hooks` use filenames and `-` as delimiters to define hook invoke order.

Inside `./hooks/`

``` js
// master.js
module.exports = {
  // sync hook
  hook1: function (data) {
    // manipulate `data`
    data.count += 1;

    // return new `data`
    return data;
  },

  // async hooks take a `resolve` parameter
  hook2: function (data1, resolve) {
    // manipulate `data1`
    resolve(data1);
  }

  // as many other hooks as you want
};
```
``` js
// Flow1.js
module.exports = {
  hook1Flow1: function (data) {
    // manipulate `data`
    data.count += 1;

    // return new `data`
    return data;
  }

  // ...
};
```

``` js
// Flow1-v2.js
module.exports = {
  hook1Flow1v2: function (data, resolve) {
    // make an async operation, like calling a service
    setTimeout(function () {
      // manipulate `data` after response
      data.count += 1;

      // resolve hook
      resolve(data);
    }, 1000);
  }

  // ...
};
```

Using `named-hooks`

``` js
var myHooks = require('named-hooks')('myHooks');

// Load hooks from `hooks` folder
myHooks.init('./hooks');

var data = {
  count: 0
};

// `invoke` will call hooks defined in `./hooks/` folder and return a promise
//    hooks called:
//      1. 'hook1'
//      2. 'hook1Flow1'
//      3. 'hook1Flow1v2'
myHooks.invoke('hook1', 'Flow1-v2', data).then(function (result) {
  console.log(data);    // { count: 0 }
  console.log(newData); // { count: 2 }
});
```

#API

#### `#init(folder)`
Load all files from `folder` synchronously and populate hooks, you'll probably do this only once.

#### `#getPossibleHookNames(hookName, identifier)`
Returns an Array with all possible hook names defined by the combination of these arguments.

#### `#defineHookResolutionRules(callback)`
If the order doesn't make sense to your project and you have other business rules, you can define your own way to resolve the hook names.

#### `#invoke(hookName, identifier, data)`
Use `invoke` if any hook is async, it returns a promise with the transformed data. It'll invoke all hooks returned by `#getPossibleHookNames(hookName, identifier)` that are defined repassing all arguments provided. Arguments are passed by value, so each hook needs to return the new modified value if synchronous or resolve the promise if asynchronous.

### `#invoke(hookName, identifier)`
Returns a transform function that will resolve a promise chain. It's an utility function to be able to do
``` js
// master.js
module.exports = {
  // async hook
  hookName: function (data, resolve) {
    setTimeout(resolve, 1000, data + 5);
  }
};
```

``` js
  // example using `q` module for promises, it'll work with
  // any promise implementation that complies with A+
  q(5)
    .then(namedHooks.invoke('hookName', 'indentifier'))
    .then(console.log);

  // outputs `10`
```
as opposed to crazy bindins:
``` js
  // works the exact same way, but looks cryptic..
  q(5)
    .then(namedHooks.invoke.bind(namedHooks, 'hookName', 'indentifier'))
    .then(console.log);

  // outputs `10`
```

#### `#invokeSync(hookName, identifier, data)`
Works the same way as `#invoke`, but returns the actual transformed data instead of a promise, useful if all hooks are exclusively synchronous.All hooks needs to return the new modified value.

#Contributing
Any PR is more than welcome, just make sure your stuff is tested and that all tests are passing.

**tl;dr**: `npm test` must be green and if I delete your code it should be red :)

#License

MIT

