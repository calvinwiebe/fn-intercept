import {expect}                   from 'chai';
import {asyncObject as intercept} from '../src';

class Foo {
  bar(x, y, cb) {
    return setTimeout(() => {
      cb(x + y);
    });
  }
  baz(x, cb, y) {
    return setTimeout(() => {
      cb(x + y);
    });
  }
}

describe('asyncObject()', function() {
  it('should intercept a basic async node style callback function of an object', function(done) {
    var foo = new Foo;
    intercept(foo, 'bar', (fn, x, y, cb) => {
      expect(x).to.eq(2);
      expect(y).to.eq(3);
      x = 1;
      return fn(x, y, cb);
    }, (fn, x) => {
      expect(x).to.eq(4);
      return fn(x * 4);
    });
    foo.bar(2, 3, x => {
      expect(x).to.eq(16);
      done();
    });
  });

  it('should intercept both fn and cb, with the cb function not in the last arg', function(done) {
    var foo = new Foo;
    intercept(foo, 'baz', {
      index: 1
    }, (fn, x, cb, y) => {
      expect(x).to.eq(2);
      expect(y).to.eq(3);
      x = 1;
      return fn(x, cb, y);
    }, (fn, x) => {
      expect(x).to.eq(4);
      return fn(x * 4);
    });
    foo.baz(2, x => {
      expect(x).to.eq(16);
      done();
    }, 3);
  });

  it('should only wrap the first function, not the callback', function(done) {
    var foo = new Foo;
    intercept(foo, 'bar', (fn, x, y, cb) => {
      expect(x).to.eq(2);
      expect(y).to.eq(3);
      x = 1;
      return fn(x, y, cb);
    });
    foo.bar(2, 3, x => {
      expect(x).to.eq(4);
      done();
    });
  });

  it('should restore properly', function(done) {
    var foo = new Foo;
    intercept(foo, 'bar', (fn, x, y, cb) => {
      expect(x).to.eq(2);
      expect(y).to.eq(3);
      x = 1;
      return fn(x, y, cb);
    });
    foo.bar(2, 3, x => {
      expect(x).to.eq(4);
      foo.bar.restore();
      foo.bar(2, 3, x => {
        expect(x).to.eq(5);
        done();
      });
    });
  });

  it('should not wrap the function if we do not give any intercepts', function(done) {
    var foo = new Foo;
    intercept(foo, 'bar');
    foo.bar(2, 3, x => {
      expect(x).to.eq(5);
      done();
    });
  });

  it('should not wrap anything if arguments are invalid', function() {
    expect(intercept()).to.not.be.ok;
    expect(intercept(null)).to.not.be.ok;
    expect(intercept(1)).to.not.be.ok;
    expect(intercept(function() {})).to.not.be.ok;
    var foo = new Foo;
    expect(intercept(foo, 'nothing')).to.not.be.ok;
    expect(intercept(foo, 'bar', null, null)).to.not.be.ok;
    expect(intercept(foo, 'bar', {}, null, null)).to.not.be.ok;
  });
});
