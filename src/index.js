/**
 *
 * `intercept`
 *
 * Intercept a javascript function and run code before or after, or change arguments to original function. Useful for
 * testing, or watching a function.
 *
 */

"use strict";

/**
 * Intercept a synchronous function.
 * @param  {Function} original    the function to wrap
 * @param  {Function} intercept   the intercepting function
 * @return {Function} the wrapped function
 */
export function sync(original, intercept) {
  if ("function" !== typeof intercept) return original;

  var wrapped = function(...args) {
    return intercept.apply(this, [original].concat(args));
  }
  // noop. Restoring won't do anything as we may not be bound to any object. Keep api, though.
  wrapped.restore = function() {};
  return wrapped;
}

/**
 * Intercept a synchronous member function of an object. This will actually replace the function reference on the
 * object. You can use `obj.fnName.restore()` to put it back to what it was.
 *
 * @param  {Object} obj         the object instance
 * @param  {Function} fnName    the name of the member function to wrap
 * @param  {Function} intercept the intercepting function
 * @return {Function}           the reference to the wrapped function
 */
export function syncObject(obj, fnName, intercept) {
  if ("function" !== typeof intercept) return;
  if ("undefined" === typeof(obj) || "[object Object]" !== Object.prototype.toString.call(obj)) return;
  var original = obj[fnName];
  if ("undefined" === typeof original) return;

  var bound = original.bind(obj);
  var wrapped = function(...args) {
    return intercept.apply(obj, [bound].concat(args));
  }
  wrapped.restore = function() {
    obj[fnName] = original;
  }
  obj[fnName] = wrapped;
  return wrapped;
}

/**
 * Wrap an asynchronous function. In this case you can intercept the function itself, and its intended callback
 * function. Intercepting the callback is optional.
 *
 * @param  {Function} original    the function to wrap
 * @param  {Object}   options     an options hash. Only option is `index`. Use to specify the index of the callback fn
 *                                in `original`'s arguments.
 * @param  {Function} intercept   the intercepting function
 * @param  {Function} cbIntercept the intercepting function for the callback
 * @return {Function}             a reference to the wrapped function for `original`
 */
export function async(original, options, intercept, cbIntercept) {
  if ("function" === typeof options) {
    cbIntercept = intercept;
    intercept = options;
    options = {};
  }
  if ("function" !== typeof(intercept) && "function" !== typeof(cbIntercept)) {
    return original;
  }

  var wrapCb = "function" === typeof cbIntercept;
  var wrapped = function(...args) {
    var index = options.index ? options.index : args.length - 1;
    var cb = args[index];
    if (wrapCb) {
      var wrappedCb = exports.sync(cb, cbIntercept);
      args.splice(index, 1, wrappedCb);
    }
    return intercept.apply(this, [original].concat(args));
  }
  return wrapped;
}

/**
 * Wrap an asynchronous member function of an object. As in `syncObject`, this will modify the function reference for
 * `obj[fnName]`. One can call `obj[fnName].restore()` to put it back to its original.
 *
 * @param  {Object}   obj         [description]
 * @param  {String}   fnName      the name of member function to wrap
 * @param  {Object}   options     an options hash. Only option is `index`. Use to specify the index of the callback fn
 *                                in `original`'s arguments.
 * @param  {Function} intercept   the intercepting function
 * @param  {Function} cbIntercept the intercepting function for the callback
 * @return {Function}             a reference to the wrapped function for `fnName`
 */
export function asyncObject(obj, fnName, options, intercept, cbIntercept) {
  if ("undefined" === typeof(obj) || "[object Object]" !== Object.prototype.toString.call(obj)) return;
  var original = obj[fnName];
  if ("undefined" === typeof original) return;
  var wrapped = exports.async(original, options, intercept, cbIntercept);
  if (wrapped === original) return;
  var wrapped = wrapped.bind(obj)
  wrapped.restore = function() {
    obj[fnName] = original;
  }
  obj[fnName] = wrapped;
  return wrapped;
}
