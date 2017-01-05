var assert = require('chai').assert;

describe('math module', function() {
    xit('should add numbers', function() {

        assert.equal( (1 + 1), '2' );
        assert.strictEqual( 127 + 319, 446 );

        var actual = [1,2,3];
        var expected = [1,2,3];
        assert.deepEqual(actual,expected,'The arrays should be exactly equal');
    });
});
