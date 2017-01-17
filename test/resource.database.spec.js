var assert = require('chai').assert;
var path = './test/test-data/param-map-files';
var dateFormat = 'MM/DD/YYYY';

var ResourceDatabase = require('../src/resource.database');
var ResourceParameterMapper = require('../src/handlers/resource.parameter.mapper');
var resourceParameterMapper = new ResourceParameterMapper(dateFormat, path);

describe('In memory json database start up tests', function() {
    it('testStart() - Using default file extension should read the json datafiles residing in the data path into in memory resource database', function() {
        var path = './test/test-data';

        var resourceDatabase = new ResourceDatabase(resourceParameterMapper,path);

        resourceDatabase.start();

        assert.equal(2,Object.keys(global.DATABASE).length);
        assert.equal(3,Object.keys(global.DATABASE['people']).length);
        global.DATABASE['people'].forEach(function(person){
            assert.isTrue(person.dob.isValid());
        });
        assert.equal(2,Object.keys(global.DATABASE['company-departments']).length);
    });
	
    it('testStart() - Using user provided file extension should read the json datafiles residing in the data path into in memory resource database', function() {
        var path = './test/test-data';

        var resourceDatabase = new ResourceDatabase(resourceParameterMapper, path, '.json');

        resourceDatabase.start();

        assert.equal(2,Object.keys(global.DATABASE).length);
        assert.equal(3,Object.keys(global.DATABASE['people']).length);
        global.DATABASE['people'].forEach(function(person){
            assert.isTrue(person.dob.isValid());
        });
        assert.equal(2,Object.keys(global.DATABASE['company-departments']).length);
		
        resourceDatabase = new ResourceDatabase(resourceParameterMapper, path, '.jsonx');

        resourceDatabase.start();

        assert.equal(0,Object.keys(global.DATABASE).length);
    });
});
