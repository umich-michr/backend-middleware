var assert = require('chai').assert;
var dataFilePath = './test/test-data';
var mappingFilesPath = './test/test-data/param-map-files';
var dateFormat = 'MM/DD/YYYY';

var ResourceDatabase = require('../../src/database/resource.database');
var ResourceParameterMapper = require('../../src/handlers/resource.parameter.mapper');
var resourceParameterMapper = new ResourceParameterMapper(dateFormat, mappingFilesPath);

var expectedDobArr = [315550800,347086800,-288471600];

describe('In memory json database start up tests', function () {
    it('testStart() - Using default file extension should read the json datafiles residing in the data path into in memory resource database and convert date fields to long numeric date time representation', function () {
        var resourceDatabase = new ResourceDatabase(resourceParameterMapper, dataFilePath);

        resourceDatabase.start();

        assert.equal(2, Object.keys(global.DATABASE).length);
        assert.equal(3, Object.keys(global.DATABASE['people']).length);
        global.DATABASE['people'].forEach(function (person, index) {
            assert.strictEqual(person.dob,expectedDobArr[index],'date of birth field of json object is not converted to long format');
        });
        assert.equal(2, Object.keys(global.DATABASE['company-departments']).length);
    });

    it('testStart() - Using user provided file extension should read the json datafiles residing in the data path into in memory resource database and convert date fields to long numeric date time representation', function () {
        var resourceDatabase = new ResourceDatabase(resourceParameterMapper, dataFilePath, '.json');
        resourceDatabase.start();

        assert.equal(2, Object.keys(global.DATABASE).length);
        assert.equal(3, Object.keys(global.DATABASE['people']).length);
        global.DATABASE['people'].forEach(function (person, index) {
            assert.strictEqual(person.dob,expectedDobArr[index],'date of birth field of json object is not converted to long format');
        });
        assert.equal(2, Object.keys(global.DATABASE['company-departments']).length);

        resourceDatabase = new ResourceDatabase(resourceParameterMapper, dataFilePath, '.jsonx');

        resourceDatabase.start();

        assert.equal(0, Object.keys(global.DATABASE).length);
    });
});
