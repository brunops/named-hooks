#named-hooks

Allow hooks to be defined and invoked in order based on its names.

#Usage

By default, `named-hooks` use filenames and `-` as delimiters to define hook invoke order.

Inside `./hooks/`

``` js
// master.js
module.exports = {
  hook1: function (data) {
    // manipulate `data`
    data.count += 1;

    // return new `data`
    return data;
  },

  hook2: function (data1, data2) {
    // manipulate `data1` and `data2`
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
  hook1Flow1v2: function (data) {
    // manipulate `data`
    data.count += 1;

    // return new `data`
    return data;
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

// `invoke` will call hooks defined in `./hooks/` folder
//    hooks called:
//      1. 'hook1'
//      2. 'hook1Flow1'
//      3. 'hook1Flow1v2'
var newData = myHooks.invoke('hook1', 'Flow1-v2', data);

console.log(data); // { count: 0 }
console.log(newData); // { count: 3 }
```

#API

#### `#init(folder)`
Load all files from `folder` synchronously and populate hooks, you probably want to do this once.

#### `#getPossibleHookNames(hookName, identifier)`
Returns an Array with all possible hook names defined by the combination of these arguments.

#### `#defineHookResolutionRules(callback)`
If the order doesn't make sense to your project and you have other business rules, you can define your own way to resolve the hook names.

#### `#invoke(hookName, identifier, data1, ...)`
Invoke all hooks returned by `#getPossibleHookNames(hookName, identifier)` that are defined repassing all arguments provided. Arguments are passed by value, so each hook needs to return the new modified value.

#Contributing
Any PR is more than welcome, just make sure your stuff is tested and that all tests are passing.

**tl;dr**: `npm test` must be green and if I delete your code it should be red :)

#License

MIT

