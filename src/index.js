/**
 *
 * `node-intercept`
 *
 * Intercept a javascript function and run code before or after, or change arguments to original function. Useful for
 * testing, or watching a function.
 *
 */

"use strict";

export function sync(original, intercept) {
    var wrapped = function(...args) {
        return intercept.apply(this, [original].concat(args));
    }
    // noop. Restoring won't do anything as we may not be bound to any object. Keep api, though.
    wrapped.restore = function() {};
    return wrapped;
}

export function syncObject(obj, fnName, intercept) {
    var original = obj[fnName]
    var bound = obj[fnName].bind(obj);
    var wrapped = function(...args) {
        return intercept.apply(obj, [bound].concat(args));
    }
    wrapped.restore = function() { obj[fnName] = original; }
    obj[fnName] = wrapped;
    return wrapped;
}

export function async(original, options, intercept, cbIntercept) {
    if ("function" === typeof options) {
        cbIntercept = intercept;
        intercept = options;
        options = {};
    }
    var wrapped = function(...args) {
        var index = options.index ? options.index : args.length - 1;
        var cb = args[index];
        var wrappedCb = exports.sync(cb, cbIntercept);
        args.splice(index, 1, wrappedCb);
        return intercept.apply(this, [original].concat(args));
    }
    return wrapped;
}
