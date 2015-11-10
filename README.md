# `intercept`

Similar to what [sinon.js](http://sinonjs.org/) does to stub functions, but in a compact and super tiny library. Useful for debug mode in browsers where size is important, or where you want to use function intercepting outside of testing.

What these functions will do is take an original function, wrap it with another that will call a function you provide with a reference to the original, and all of the arguments that the original was called with. It will return the wrapped function reference to call as if it were the original.

In the `syncObject/asyncObject` cases, it will take an object instance, and a function name. It will replace the function reference on the object with a new wrapped function. You can later put the original function back by calling `obj[fnName].restore()`.

# Usage

```javascript

// example of a simple sync function

var intercept = require('intercept').sync;

var foo = function(x, y) {
  return x * y;
}

// `fn` here is the reference to `foo`.
var wrapped = intercept(foo, function(fn, x, y) {
  var result = fn(x*2, y*2);
  return 'The answer is ' + result;
});

console.log(wrapped(1, 2));

// This will output 'The answer is 6'

console.log(foo(1, 2));

// This will output 3
```

The same can be done for `async` functions, and functions that are members of an object. Please see the [tests](https://github.com/calvinwiebe/intercept/tree/master/test) for a bunch of examples.

# Promises

Nothing special needs to be done to support promises. You can simply use the `sync` functions. Since you get a reference to the original function, you can call the function, intercept its `.then`, and do whatever you want.

## Example

```javascript
var sync = require('intercept').sync;

var foo = function(x, y) {
  return Promise.resolve(x + y);
}
var wrapped = sync(foo, function(fn, x, y) {
  return Promise.resolve()
  .then(function() {
    return fn(x, y);
  })
  .then(function(result) {
    return result * 2;
  });
});

wrapped(1, 1).then(function(result) {
  console.log(result);
});

// should output 4

```

# API

## `sync(original, intercept)`

Wrap a synchronous function.
[examples](https://github.com/calvinwiebe/intercept/blob/master/test/sync.js)

## `syncObject(obj, fnName, intercept)`

Wrap a synchronous member function of an object.
[examples](https://github.com/calvinwiebe/intercept/blob/master/test/syncObject.js)

## `async(original, options, intercept, cbIntercept)`

Wrap an asynchronous function.
[examples](https://github.com/calvinwiebe/intercept/blob/master/test/async.js)

## `asyncObject(obj, fnName, options, intercept, cbIntercept)`

Wrap an asynchronous member function of an object.
[examples](https://github.com/calvinwiebe/intercept/blob/master/test/asyncObject.js)
