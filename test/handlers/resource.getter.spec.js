var assert = require('chai').assert;
var moment = require('moment');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var HttpResponse = require('../../src/handlers/http.response');

var people = [{
    id:1,
    firstName: 'John',
    lastName: 'Doe'
}];
var resourceDao = {
    get:function(resourceName, daoResourceQueryObject){
        if(resourceName==='people' && !daoResourceQueryObject){
            return people;
        }
        if(resourceName==='people' && daoResourceQueryObject.id==1){
            return people[0];
        }
    }
};

var resourceGetter = proxyquire('../../src/handlers/resource.getter',{'../daos/resource.dao':resourceDao});

describe('Handler to return http resource for GET requests', function() {

    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };

    it('testResourceGetter(String resourceName) - should return http response with resource corresponding to resource name', function() {
        var resourceName = 'people';

        var resourceParamMapper = {
            toResourceDaoQueryObject:function(urlParams){
                return null
            }
        };

        var response = resourceGetter({resourceName: resourceName}, resourceParamMapper);

        var expected = new HttpResponse(200,httpHeaders,people);

        assert.deepEqual(response,expected,'Resource getter did not return the expected http response');
    });

    it('testResourceGetter(String resourceName) - should return http response with resource queried by the query string and/or url params', function() {
        var resourceName = 'people';
        var resourceParamMapper = {
            toResourceDaoQueryObject:function(urlParams){
                return {id:1};
            }
        };

        var response = resourceGetter({resourceName: resourceName, resourceId:5}, resourceParamMapper);

        var expected = new HttpResponse(200,httpHeaders,people[0]);

        assert.deepEqual(response,expected,'Resource getter did not return the expected http response when resource has to be queried by parameters');
    });

});