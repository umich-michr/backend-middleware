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

        var expected = new HttpResponse(200, httpHeaders, JSON.stringify(people), resourceName);

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

        var expected = new HttpResponse(200, httpHeaders, JSON.stringify(people[0]), resourceName);

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

        var response = new HttpResponse(200, httpHeaders, JSON.stringify(people), resourceName);

        var transformedResponse = {};
        var responseTransformerCallback = sinon.stub().returns(transformedResponse);

        var actual = resourceGetter(handlerPayload, resourceParamMapper, responseTransformerCallback);

        assert.isTrue(responseTransformerCallback.calledWith(response, handlerPayload.urlParameters));
        assert.deepEqual(actual, transformedResponse, 'Resource getter did not return the expected http response');
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

        var response = new HttpResponse(200, httpHeaders, JSON.stringify(people), resourceName);

        var responseTransformerCallback = sinon.stub().returns(undefined);
        var actual = resourceGetter(handlerPayload, resourceParamMapper, responseTransformerCallback);

        assert.isTrue(responseTransformerCallback.calledWith(response, handlerPayload.urlParameters));
        assert.deepEqual(actual, response, 'Resource getter did not return the response http response');
    });
});
