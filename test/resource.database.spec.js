var assert = require('chai').assert;

var ResourceDatabase = require('../src/resource.database');

describe('In memory json database start up tests', function() {
    it('testStart() - Using default file extension should read the json datafiles residing in the data path into in memory resource database', function() {
        var path = './test/test-data';

        var resourceDatabase = new ResourceDatabase(path);

        resourceDatabase.start();

        assert.equal(2,Object.keys(global.DATABASE).length);
        assert.equal(3,Object.keys(global.DATABASE['people']).length);
        assert.equal(2,Object.keys(global.DATABASE['company-departments']).length);
    });
	
    it('testStart() - Using user provided file extension should read the json datafiles residing in the data path into in memory resource database', function() {
        var path = './test/test-data';

        var resourceDatabase = new ResourceDatabase(path, '.json');

        resourceDatabase.start();

        assert.equal(2,Object.keys(global.DATABASE).length);
        assert.equal(3,Object.keys(global.DATABASE['people']).length);
        assert.equal(2,Object.keys(global.DATABASE['company-departments']).length);
		
        resourceDatabase = new ResourceDatabase(path, '.jsonx');

        resourceDatabase.start();

        assert.equal(0,Object.keys(global.DATABASE).length);
    });
});
