import {expect}             from 'chai';
import {async as intercept} from '../src';

describe('async()', function() {
  it('should intercept a basic async node style callback function', function(done) {
    var foo = (x, cb) => {
      setTimeout(() => {
        x = x * 2;
        cb(x)
      }, 0);
    }
    var wrapped = intercept(foo, (fn, x, cb) => {
      expect(x).to.eq(2)
      x = 1;
      return fn(x, cb);
    }, (fn, x) => {
      expect(x).to.eq(2);
      return fn(x * 4);
    });
    wrapped(2, x => {
      expect(x).to.eq(8);
      done();
    });
  });

  it('should intercept both fn and cb, with the cb function not in the last arg', function(done) {
    var bar = function(x, y, cb, z) {
      setTimeout(function() {
        cb('blarg');
      }, 0);
    }
    var wrapped = intercept(bar, {
      index: 2
    }, function(fn, x, y, cb, z) {
      expect(x + y + z).to.eq(6);
      fn(x, y, cb, z);
    }, function(cb, str) {
      expect(str).to.eq('blarg');
      cb('boo');
    });
    wrapped(1, 2, function(str) {
      expect(str).to.eq('boo');
      done();
    }, 3);
  });

  it('should only wrap the first function, not the callback', function(done) {
    var baz = function(x, cb) {
      expect(x).to.eq(-1);
      setTimeout(cb, 0);
    }
    var wrapped = intercept(baz, function(fn, x, cb) {
      expect(x).to.eq(9000);
      fn(-1, cb);
    });
    wrapped(9000, function() {
      done();
    });
  });

  it('should not wrap the function if we do not give any intercepts', function(done) {
    var baz = function(x, cb) {
      setTimeout(cb, 0);
    }
    var wrapped = intercept(baz);
    expect(wrapped).to.eq(baz);
    wrapped(9000, function() {
      done();
    });
  });

  it('should not wrap anything if arguments are invalid', function() {
    var foo = function() {};
    expect(intercept()).to.not.be.ok;
    expect(intercept(null)).to.not.be.ok;
    expect(intercept(1)).to.eq(1);
    var x = function() {};
    expect(intercept(x)).to.eq(x);
    expect(intercept(x)).to.eq(x);
    expect(intercept(x, null, null)).to.eq(x);
    expect(intercept(x, {}, null, null)).to.eq(x);
  });
});
