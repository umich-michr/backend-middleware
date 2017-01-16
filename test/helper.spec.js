var assert = require('chai').assert;
var moment = require('moment');
var sinon = require('sinon');

var helperFunctions = require('../src/helper');
var defaultDateFormat = 'YYYY-MM-DDThh.mm.ss.sss';

describe('Helper functions used to do boring things such as parsing values, slicing dicing strings etc.', function() {
    it('testCastToParamValue(date) - should parse a string matching a date format to date', function() {
        var value ='2017-01-05T00.00.00.000';
        var expected = moment(value,defaultDateFormat);

        var actual = helperFunctions.castToParamValue(value, 'date');

        assert.deepEqual(actual,expected,'The date string matching default date format is not converted to date object correctly.');

        value = '01/01/2017';
        expected = moment(value,'MM/DD/YYYY');

        actual = helperFunctions.castToParamValue(value, 'date', 'MM/DD/YYYY');
        assert.deepEqual(actual,expected,'The date string matching user specified date format is not converted to date object correctly.');
    });

    it('testCastToParamValue(numeric) - should parse a string to number if it is a number', function() {
        var value ='5';
        var expected = 5;

        var actual = helperFunctions.castToParamValue(value, 'numeric');

        assert.strictEqual(actual,expected,'The numeric string is not converted to number correctly.');
    });

    it('testCastToParamValue(string) - should leave string as string', function() {
        var value ='abc';
        var expected = 'abc';

        var actual = helperFunctions.castToParamValue(value);

        assert.strictEqual(actual,expected,'The string is not left as string.');
    });

    it('testCastToParamValue(Array of Strings) - should return an array of Strings', function() {
        var value =['abc', 'def'];
        var expected = ['abc', 'def'];

        var actual = helperFunctions.castToParamValue(value);

        assert.deepEqual(actual,expected,'The array of string is not left as array of string.');
    });

    it('testAbsolutePath(string) - the path relative to the project root should be transformed to absoule path string', function() {
        var projectPath = require('path').dirname(__dirname);

        var actual = helperFunctions.absolutePath('.',projectPath);

        assert.strictEqual(actual,projectPath+'/','The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('./',projectPath);

        assert.strictEqual(actual,projectPath+'/','The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('/./',projectPath);

        assert.strictEqual(actual,projectPath+'/','The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('././',projectPath);

        assert.strictEqual(actual,projectPath+'/','The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('././../.../a///b//.//..//././/./e/.',projectPath);

        assert.strictEqual(actual,projectPath+'/../../a/b/../e','The absolute path is not found correctly');
    });

    it('testReadFilesToMap(String path, String fileNameExtension) - should read the json datafiles residing in the path relative to the project root into an object whose keys are found by stripping off fileNameExtension', function() {
        var path = './test/test-data';

        var actual = helperFunctions.readFilesToMap(path,'.json');

        assert.equal(2,Object.keys(actual).length);
        assert.equal(3,Object.keys(actual['people']).length);
        assert.equal(2,Object.keys(actual['company-departments']).length);

        actual = helperFunctions.readFilesToMap(path);

        assert.equal(0,Object.keys(actual).length,'The file extension does not match any file in the path, should have returned an empty object');

        actual = helperFunctions.readFilesToMap('.git');

        assert.equal(0,Object.keys(actual).length,'There are no files that could be used by node require statement in the path provided so should have returned an empty object');
    });
});
