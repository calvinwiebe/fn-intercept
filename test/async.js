import {expect} from 'chai';

var intercept = require('../src/').async;

describe('async()', function () {
    it('should intercept a basic async node style callback function', function (done) {
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
});
