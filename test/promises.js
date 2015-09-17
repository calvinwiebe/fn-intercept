import * as chai          from 'chai';
import {sync, syncObject} from '../src';

chai.use(require('chai-as-promised'));
var {expect} = chai;

describe('using with promises', function() {
  describe('sync() with promises', function() {
    it('should intercept arguments to promise function', function() {
      var foo = function(x, y) {
        return Promise.resolve(x + y);
      }
      var wrapped = sync(foo, function(fn, x, y) {
        x = x * 2;
        return fn(x, y);
      });
      return expect(wrapped(2, 2)).to.eventually.eq(6);
    });

    it('should intercept result of promise', function() {
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
      return expect(wrapped(2, 2)).to.eventually.eq(8);
    });
  });

  class Foo {
    bar(x, y) {
      return Promise.resolve(x + y);
    }
  }

  describe('syncObject() with promises', function() {
    it('should intercept arguments to promise function', function() {
      var foo = new Foo;
      var wrapped = syncObject(foo, 'bar', function(fn, x, y) {
        x = x * 2;
        return fn(x, y);
      });
      return expect(wrapped(2, 2)).to.eventually.eq(6);
    });

    it('should intercept result of promise', function() {
      var foo = new Foo;
      var wrapped = syncObject(foo, 'bar', function(fn, x, y) {
        return Promise.resolve()
        .then(function() {
          return fn(x, y);
        })
        .then(function(result) {
          return result * 2;
        })
      });
      return expect(wrapped(2, 2)).to.eventually.eq(8);
    });
  });
});
