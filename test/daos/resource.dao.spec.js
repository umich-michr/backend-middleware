var assert = require('chai').assert;
var moment = require('moment');
var sinon = require('sinon');

var resourceDao = require('../../src/daos/resource.dao');

var people = [{
    firstName: 'John',
    lastName: 'Doe'
}];
var globalDB = global.DATABASE;

describe('DAO to query resources in the in-memory JSON object db', function() {
    beforeEach(function() {
        global.DATABASE={};
        global.DATABASE['people']=people;
    });

    afterEach(function() {
        global.DATABASE=globalDB;
    });

    it('testGetAll(String resourceName) - should return resource from in memory database corresponding to resource name', function() {
        var resourceName = 'people';

        var resource = resourceDao.getAll(resourceName);

        assert.deepEqual(resource,people,'Resource dao getAll did not return the expected resource');
    });

    it('testGet(String resourceName, Object daoQueryParam) - should return object(s) from in memory database as http resource corresponding to resource name matching the attribute values specified in daoQueryParam', function() {
        var resourceName = 'people';
        var daoQueryParam ={};
        var expected = {};

        var resource = resourceDao.getAll(resourceName, daoQueryParam);

        assert.deepEqual(resource,expected,'Resource dao did not return the object(s) expected as resource');
    });
});