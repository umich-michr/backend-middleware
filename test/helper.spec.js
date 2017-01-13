var assert = require('chai').assert;
var moment = require('moment');
var sinon = require('sinon');

var helperFunctions = require('../src/helper');
var defaultDateFormat = 'YYYY-MM-DDThh.mm.ss.sss';

describe('Helper functions used to do boring things such as  parsing values, slicing dicing strings etc.', function() {
    it('testCastToParamValue(date) - should parse a string matching a date format to date', function() {
        var value ='2017-01-05T00.00.00.000';
        var expected = moment(value,defaultDateFormat);

        var actual = helperFunctions.castToParamValue(value);

        assert.deepEqual(actual,expected,'The date string matching default date format is not converted to date object correctly.');

        value = '01/01/2017';
        expected = moment(value,'MM/DD/YYYY');

        actual = helperFunctions.castToParamValue(value, 'MM/DD/YYYY');
        assert.deepEqual(actual,expected,'The date string matching user specified date format is not converted to date object correctly.');
    });

    it('testCastToParamValue(numeric) - should parse a string to number if it is a number', function() {
        var value ='5';
        var expected = 5;

        var actual = helperFunctions.castToParamValue(value);

        assert.strictEqual(actual,expected,'The numeric string is not converted to number correctly.');
    });

    it('testCastToParamValue(string) - should leave string as string', function() {
        var value ='abc';
        var expected = 'abc';

        var actual = helperFunctions.castToParamValue(value);

        assert.strictEqual(actual,expected,'The string is not left as string.');
    });
});