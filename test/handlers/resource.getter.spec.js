var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var _ = require('lodash');

var makeParameterMapper = require('../../src/handlers/resource.parameter.mapper');
var HandlerResponse = require('../../src/handlers/handler.response');
var HandlerPayload = require('../../src/handlers/handler.payload');

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
        return null;
    }
};

var resourceGetter = proxyquire('../../src/handlers/resource.getter', {
    '../database/daos/resource.dao': resourceDao
});

function makeHandlerLookup(options){
    return {name: 'defaultHandlerName', options};
}

function mockParameterMapper(changes) {
  const mapper = makeParameterMapper();
  _.assign(mapper, changes);
  return mapper;
}

describe('Handler to return http resource for GET requests', function () {

    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };

    it('testResourceGetter(Object handlerPayload, function responseTransformerCallback) - should return http response with resource corresponding to resource name', function () {
        var resourceName = 'people';

        var resourceParamMapper = mockParameterMapper({
            toResourceDaoQueryObject: function () {
                return null;
            },
            isQueryById: function () {
                return false;
            }
        });

        var httpPayload = new HandlerPayload({}, makeHandlerLookup({$resourceName: resourceName}), resourceParamMapper);
        var response = resourceGetter(httpPayload);

        var expected = new HandlerResponse(200, httpHeaders, JSON.stringify(people), resourceName);

        assert.deepEqual(response, expected, 'Resource getter did not return the expected http response');
    });

    it('testResourceGetter(Object handlerPayload, function responseTransformerCallback) - should return http response with resource queried by the query string and/or url params if resource is found by id', function () {
        var resourceName = 'people';
        var resourceParamMapper = mockParameterMapper({
            toResourceDaoQueryObject: function () {
                return {
                    id: 1
                };
            },
            isQueryById: function () {
                return true;
            }
        });

        var handlerPayload = new HandlerPayload(
          {},
          makeHandlerLookup({
            $resourceName: resourceName,
            $resourceId: 1
          }),
          resourceParamMapper);

        var response = resourceGetter(handlerPayload);

        var expected = new HandlerResponse(200, httpHeaders, JSON.stringify(people[0]), resourceName);

        assert.deepEqual(response, expected, 'Resource getter did not return the expected http response when resource has to be queried by parameters');
    });

    it('testResourceGetter(Object handlerPayload, function responseTransformerCallback) - should return 404 http response with resource not found if resource is not found by id', function () {
        var resourceName = 'people';
        var resourceParamMapper = mockParameterMapper({
            toResourceDaoQueryObject: function () {
                return {
                    id: 5
                };
            },
            isQueryById: function () {
                return true;
            }
        });

        var handlerPayload = new HandlerPayload({},makeHandlerLookup({
            $resourceName: resourceName,
            $resourceId: 5
        }),resourceParamMapper);

        var response = resourceGetter(handlerPayload);

        var failedOperationResponse = {operation:'fetch-resource',result:'no matching resource is found'};

        var expected = new HandlerResponse(404, httpHeaders, JSON.stringify(failedOperationResponse), resourceName);

        assert.deepEqual(response, expected, 'Resource getter did not return the expected http response when resource has to be queried by parameters');
    });

    it('testResourceGetter(Object handlerPayload, function responseTransformerCallback) - should return response with transformed resource if callback provided and returns transformed resource', function () {
        var resourceName = 'people';

        var resourceParamMapper = mockParameterMapper({
            toResourceDaoQueryObject: function () {
                return null;
            },
            isQueryById: function () {
                return false;
            }
        });

        var urlParameters = {
            $resourceName: resourceName,
            page: 'page'
        };

        var handlerPayload = new HandlerPayload({},makeHandlerLookup(urlParameters),resourceParamMapper);

        var response = new HandlerResponse(200, httpHeaders, JSON.stringify(people), resourceName);

        var transformedResponse = {};
        var responseTransformerCallback = sinon.stub().returns(transformedResponse);

        var actual = resourceGetter(handlerPayload, responseTransformerCallback);

        assert.isTrue(responseTransformerCallback.calledWith(handlerPayload, response));
        assert.deepEqual(actual, transformedResponse, 'Resource getter did not return the expected http response');
    });

    it('testResourceGetter(Object handlerPayload, function responseTransformerCallback) - should return response with resource intact if callback returns nothing', function () {
        var resourceName = 'people';

        var resourceParamMapper = mockParameterMapper({
            toResourceDaoQueryObject: function () {
                return null;
            },
            isQueryById: function () {
                return false;
            }
        });

        var urlParameters = {
            $resourceName: resourceName,
            page: 'page'
        };

        var handlerPayload = new HandlerPayload({},makeHandlerLookup(urlParameters),resourceParamMapper);

        var response = new HandlerResponse(200, httpHeaders, JSON.stringify(people), resourceName);

        var responseTransformerCallback = sinon.stub().returns(undefined);
        var actual = resourceGetter(handlerPayload, responseTransformerCallback);

        assert.isTrue(responseTransformerCallback.calledWith(handlerPayload,response));
        assert.deepEqual(actual, response, 'Resource getter did not return the response http response');
    });

    it('testResourceGetter(Object handlerPayload, function responseTransformerCallback) - should return 404 response with resource if resource is not found', function () {
        var resourceName = 'non-existing-resource';

        var resourceParamMapper = mockParameterMapper({
            toResourceDaoQueryObject: function () {
                return;
            },
            isQueryById: function () {
                return false;
            }
        });

        var urlParameters = {
            $resourceName: resourceName,
            page: 'page'
        };

        var handlerPayload = new HandlerPayload({},makeHandlerLookup(urlParameters),resourceParamMapper);

        var response = new HandlerResponse(404, httpHeaders, JSON.stringify({operation:'fetch-resource',result:'no matching resource is found'}), resourceName);

        var responseTransformerCallback = sinon.stub().returns(undefined);
        var actual = resourceGetter(handlerPayload, responseTransformerCallback);

        assert.isTrue(responseTransformerCallback.calledWith(handlerPayload,response));
        assert.deepEqual(actual, response, 'Resource getter did not return the response http response');
    });

});
