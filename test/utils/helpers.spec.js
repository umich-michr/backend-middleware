var assert = require('chai').assert;
var moment = require('moment');

var helperFunctions = require('../../src/utils/helpers');
var testDateFormat = 'MM-DD-YYYY';

describe('Helper functions used to do boring things such as parsing values, slicing dicing strings etc.', function () {
    it('testCastToParamValue(date) - should parse a string matching a date format to date', function () {
        var value = '2017-01-05T00.00.00.000';
        var expected = moment(value, helperFunctions.defaultDateFormat);

        var actual = helperFunctions.castToParamValue(value, 'date');

        assert.deepEqual(actual, expected, 'The date string matching default date format is not converted to date object correctly.');

        value = '01/01/2017';
        expected = moment(value, 'MM/DD/YYYY');
        actual = helperFunctions.castToParamValue(value, 'date', 'MM/DD/YYYY');
        assert.deepEqual(actual, expected, 'The date string matching user specified date format is not converted to date object correctly.');
    });

    it('testCastToParamValue(numeric) - should parse a string to number if it is a number', function () {
        var value = '5';
        var expected = 5;

        var actual = helperFunctions.castToParamValue(value, 'numeric');

        assert.strictEqual(actual, expected, 'The numeric string is not converted to number correctly.');
    });

    it('testCastToParamValue(string) - should leave string as string', function () {
        var value = 'abc';
        var expected = 'abc';

        var actual = helperFunctions.castToParamValue(value);

        assert.strictEqual(actual, expected, 'The string is not left as string.');
    });

    it('testCastToParamValue(Array of Strings) - should return an array of Strings', function () {
        var value = ['abc', 'def'];
        var expected = ['abc', 'def'];

        var actual = helperFunctions.castToParamValue(value);

        assert.deepEqual(actual, expected, 'The array of string is not left as array of string.');
    });

    it('testAbsolutePath(string) - the path relative to the project root should be transformed to absoule path string', function () {
        var path = require('path')
        var projectPath = path.resolve('.');

        var actual = helperFunctions.absolutePath('.', projectPath);

        assert.strictEqual(actual, projectPath, 'The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('./', projectPath);

        assert.strictEqual(actual, projectPath, 'The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('/./', projectPath);

        assert.strictEqual(actual, projectPath, 'The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('././', projectPath);

        assert.strictEqual(actual, projectPath, 'The absolute path is not found correctly');

        actual = helperFunctions.absolutePath('././../.../a///b//.//..//././/./e/.', projectPath);

        assert.strictEqual(actual, path.resolve('./../../a/b/../e'), 'The absolute path is not found correctly');
    });

    it('testReadFilesToMap(String path, String fileNameExtension) - should read the json datafiles residing in the path relative to the project root into an object whose keys are found by stripping off fileNameExtension', function () {
        var path = './test/test-data';

        var actual = helperFunctions.readFilesToMap(path, '.json');

        assert.equal(2, Object.keys(actual).length);
        assert.equal(3, Object.keys(actual['people']).length);
        assert.equal(2, Object.keys(actual['company-departments']).length);

        actual = helperFunctions.readFilesToMap(path);

        assert.equal(0, Object.keys(actual).length, 'The file extension does not match any file in the path, should have returned an empty object');

        actual = helperFunctions.readFilesToMap('.');

        assert.equal(0, Object.keys(actual).length, 'There are no files that could be used by node require statement in the path provided so should have returned an empty object');
    });

    it('testSetValue(String attrSelector, Object object, Object value) - should set the value of object attribute using dot"." notation to access the keys of the object', function () {
        var attrSelector = 'a.b.c';
        var value = {
            d: 5
        };

        var objWithSelectedAttribute = {
            a: {
                b: {
                    c: 1
                }
            }
        };
        var objWithoutSelectedAttribute = {
            x: 1
        };
        var objWithDifferentSelectedAttribute = {
            a: 1
        };

        helperFunctions.setValue(attrSelector, objWithSelectedAttribute, value);

        assert.deepEqual(objWithSelectedAttribute, {
            a: {
                b: {
                    c: value
                }
            }
        });

        helperFunctions.setValue(attrSelector, objWithoutSelectedAttribute, value);

        assert.deepEqual(objWithoutSelectedAttribute, {
            x: 1,
            a: {
                b: {
                    c: value
                }
            }
        });

        helperFunctions.setValue(attrSelector, objWithDifferentSelectedAttribute, value);

        assert.deepEqual(objWithDifferentSelectedAttribute, {
            a: {
                b: {
                    c: value
                }
            }
        });

        attrSelector = 'a';
        var simpleObject = {};

        helperFunctions.setValue(attrSelector, simpleObject, 5);

        assert.deepEqual(simpleObject, {
            a: 5
        });
    });

    it('testGetValue(String attrSelector, Object object) - should get the value of object attribute using dot"." notation to access the keys of the object', function () {

        var object = {
            a: {
                b: {
                    c: 1
                }
            }
        };

        var actual = helperFunctions.getValue('a.b.c', object);

        assert.equal(actual, 1);

        actual = helperFunctions.getValue('a.b', object);

        assert.deepEqual(actual, {
            c: 1
        });

        actual = helperFunctions.getValue('x.b', object);

        assert.isUndefined(actual);
    });

    it('testIsDate(object) - should return if the input is of date type', function () {
        assert.isFalse(helperFunctions.isDate());
        assert.isFalse(helperFunctions.isDate(null));
        assert.isFalse(helperFunctions.isDate({}));
        assert.isFalse(helperFunctions.isDate(1));
        assert.isFalse(helperFunctions.isDate('a'));

        assert.isTrue(helperFunctions.isDate(moment('01-13-1980', testDateFormat)));
    });

    it('testSortParamValueArray(Array array) - should sort the array in ascending order taking date objects into consideration', function () {

        actual = helperFunctions.sortParamValueArray();

        assert.isUndefined(actual);

        actual = helperFunctions.sortParamValueArray([]);

        assert.deepEqual(actual, []);

        var numberArray = [3, 5, 2, 4, 1];

        var actual = helperFunctions.sortParamValueArray(numberArray);

        assert.deepEqual(actual, [1, 2, 3, 4, 5]);

        var stringArray = ['jason', 'John', 'Jason'];

        actual = helperFunctions.sortParamValueArray(stringArray);

        assert.deepEqual(actual, ['Jason', 'John', 'jason']);

        var dateArray = [moment('01-12-1981', testDateFormat), moment('01-13-1980', testDateFormat), moment('01-12-1980', testDateFormat)];

        actual = helperFunctions.sortParamValueArray(dateArray);

        assert.deepEqual(actual, [moment('01-12-1980', testDateFormat), moment('01-13-1980', testDateFormat), moment('01-12-1981', testDateFormat)]);
    });

});
