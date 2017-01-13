var assert = require('chai').assert;

var ResourceDatabase = require('../src/resource.database');

describe('In memory json database start up tests', function() {
    it('testStart() - should read the json datafiles residing in the data path into in memory resource database', function() {
        var path = './test/test-data';

        var resourceDatabase = new ResourceDatabase(path);

        resourceDatabase.start();

        assert.equal(2,Object.keys(global.DATABASE).length);
        assert.equal(3,Object.keys(global.DATABASE['people']).length);
        assert.equal(2,Object.keys(global.DATABASE['company-departments']).length);
    });
});