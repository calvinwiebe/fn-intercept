import {expect}                  from 'chai';
import {syncObject as intercept} from '../src';

class Foo {
  bar(x, y) {
    return x + y;
  }
}

describe('syncObject', function() {
  it('should wrap a simple function of an object', function() {
    var foo = new Foo;
    intercept(foo, 'bar', function(fn, x, y) {
      expect(fn).to.be.instanceOf(Function);
      expect(x).to.eq(2);
      expect(y).to.eq(3);
      return fn(x * 2, y * 2);
    });
    var result = foo.bar(2, 3);
    expect(result).to.eq(10);
  });

  it('should restore a function to its original', function() {
    var foo = new Foo;
    intercept(foo, 'bar', function(fn) {
      expect.fail();
      return fn(1, 2);
    });
    foo.bar.restore();
    expect(foo.bar(3, 4)).to.eq(7);
  });

  it('should not wrap if we do not give an intercept', function() {
    var foo = new Foo;
    var originalBar = foo.bar;
    intercept(foo, 'bar');
    expect(foo.bar).to.eq(originalBar);
  });

  it('should not wrap anything if arguments are invalid', function() {
    expect(intercept()).to.not.be.ok;
    expect(intercept(null)).to.not.be.ok;
    expect(intercept(1)).to.not.be.ok;
    expect(intercept(function() {})).to.not.be.ok;
    var foo = new Foo;
    expect(intercept(foo, 'nothing')).to.not.be.ok;
    expect(intercept(foo, 'nothing', function(){})).to.not.be.ok;
    expect(intercept(foo, 'bar', null, null)).to.not.be.ok;
    expect(intercept(foo, 'bar', {}, null, null)).to.not.be.ok;
    expect(intercept(null, 'bar', function(){})).to.not.be.ok;
  });

});
