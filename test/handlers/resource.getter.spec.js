var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var HttpResponse = require('../../src/handlers/http.response');

var people = [{
    id: 1,
    firstName: 'John',
    lastName: 'Doe'
}];
var resourceDao = {
    get: function (resourceName, daoResourceQueryObject) {
        if (resourceName === 'people' && !daoResourceQueryObject) {
            return people;
        }
        if (resourceName === 'people' && daoResourceQueryObject.id == 1) {
            return [people[0]];
        }
    }
};

var resourceGetter = proxyquire('../../src/handlers/resource.getter', {
    '../daos/resource.dao': resourceDao
});

describe('Handler to return http resource for GET requests', function () {

    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };

    it('testResourceGetter(String resourceName) - should return http response with resource corresponding to resource name', function () {
        var resourceName = 'people';

        var resourceParamMapper = {
            toResourceDaoQueryObject: function () {
                return null;
            },
            isQueryById: function () {
                return false;
            }
        };

        var response = resourceGetter({
            request:{},
            urlParameters:{
                resourceName: resourceName
            }
        }, resourceParamMapper);

        var expected = new HttpResponse(200, httpHeaders, JSON.stringify(people));

        assert.deepEqual(response, expected, 'Resource getter did not return the expected http response');
    });

    it('testResourceGetter(String resourceName) - should return http response with resource queried by the query string and/or url params', function () {
        var resourceName = 'people';
        var resourceParamMapper = {
            toResourceDaoQueryObject: function () {
                return {
                    id: 1
                };
            },
            isQueryById: function () {
                return true;
            }
        };

        var response = resourceGetter(
            {
                request:{},
                urlParameters:{
                    resourceName: resourceName,
                    resourceId: 5
                }
            }, resourceParamMapper);

        var expected = new HttpResponse(200, httpHeaders, JSON.stringify(people[0]));

        assert.deepEqual(response, expected, 'Resource getter did not return the expected http response when resource has to be queried by parameters');
    });

    it('testResourceGetter(String resourceName) - should return response with transformed resource if callback provided and returns transformed resource', function () {
        var resourceName = 'people';

        var resourceParamMapper = {
            toResourceDaoQueryObject: function () {
                return null;
            },
            isQueryById: function () {
                return false;
            }
        };

        var urlParameters = {
            resourceName: resourceName,
            page: 'page'
        };

        var handlerPayload = {
            request: {},
            urlParameters: urlParameters
        };

        var transformedResource = {};
        var resourceTransformCallback = sinon.stub().returns(transformedResource);
        var response = resourceGetter(handlerPayload, resourceParamMapper, resourceTransformCallback);

        var expected = new HttpResponse(200, httpHeaders, JSON.stringify(transformedResource));

        assert.isTrue(resourceTransformCallback.calledWith(people, handlerPayload.urlParameters));
        assert.deepEqual(response, expected, 'Resource getter did not return the expected http response');
    });

    it('testResourceGetter(String resourceName) - should return response with resource intact if callback returns nothing', function () {
        var resourceName = 'people';

        var resourceParamMapper = {
            toResourceDaoQueryObject: function () {
                return null;
            },
            isQueryById: function () {
                return false;
            }
        };

        var urlParameters = {
            resourceName: resourceName,
            page: 'page'
        };

        var handlerPayload = {
            request: {},
            urlParameters: urlParameters
        };

        var resourceTransformCallback = sinon.stub().returns(undefined);
        var response = resourceGetter(handlerPayload, resourceParamMapper, resourceTransformCallback);

        var expected = new HttpResponse(200, httpHeaders, JSON.stringify(people));

        assert.isTrue(resourceTransformCallback.calledWith(people, handlerPayload.urlParameters));
        assert.deepEqual(response, expected, 'Resource getter did not return the expected http response');
    });
});
