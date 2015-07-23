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
myHooks.invoke('hook1', 'Flow1-v2', data);

console.log(data); // { count: 3 }
```

#License

MIT

