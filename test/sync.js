import {expect}            from 'chai';
import {sync as intercept} from '../src';

describe('sync()', function() {
  it('should wrap a simple function', function() {
    var foo = function(x, y) {
      return x + y;
    }
    var wrapped = intercept(foo, function(fn, x, y) {
      x = x * 2;
      return fn(x, y);
    });
    var result = wrapped(2, 2);
    expect(result).to.eq(6);
    wrapped.restore();
  });

  it('should keep `this` context properly', function() {
    var foo = function(x, y) {
      expect(this).to.have.property('name');
      expect(this.name).to.eq('test');
      return x + y;
    }
    var wrapped = intercept(foo, function(fn, x, y) {
      expect(this).to.have.property('name');
      expect(this.name).to.eq('test');
      return fn.call(this, x, y);
    });
    var result = wrapped.call({
      name: 'test'
    }, 2, 2);
    expect(result).to.eq(4);
  });

  it('should not wrap if we do not give an intercept', function() {
    var foo = function(x) {
      return x * 3;
    }
    var wrapped = intercept(foo);
    expect(wrapped).to.eq(foo);
    expect(foo(3)).to.eq(9);
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
