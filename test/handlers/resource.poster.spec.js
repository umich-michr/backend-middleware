var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var _ = require('lodash');

var makeParameterMapper = require('../../src/handlers/resource.parameter.mapper');
var HandlerResponse = require('../../src/handlers/handler.response');
var HandlerPayload = require('../../src/handlers/handler.payload');

function makeHandlerLookup(options){
	return {name: 'defaultHandlerName', options};
}

var people = [{
    id: 1,
    firstName: 'John',
    lastName: 'Doe'
}];
var resourceDao = {
    post: function (resourceName, newResourceObject) {
        if (resourceName === 'people' && newResourceObject.id === 0) {
            newResourceObject.id = 2;
            people.push(newResourceObject);
            return newResourceObject.id;
        }
        return null;
    }
};

var resourcePoster = proxyquire('../../src/handlers/resource.poster', {
    '../database/daos/resource.dao': resourceDao
});

describe('Handler to return http resource for POST requests', function () {

    var httpHeaders = {
        'Content-Type': 'application/json;charset=UTF-8'
    };

    it('testResourcePoster(Object handlerPayload, function responseTransformerCallback) - should return http response with the new id created', function () {
        var resourceName = 'people';
        var newPeopleObject = {
            id: 0,
            firstName: 'Jack',
            lastName: 'Smith'
        };


        var handlerPayload = new HandlerPayload(
          {body: newPeopleObject},
          makeHandlerLookup({$resourceName: resourceName}),
          makeParameterMapper());
        var response = resourcePoster(handlerPayload);

        var expected = new HandlerResponse(200, httpHeaders, JSON.stringify({id: 2}), resourceName);

        assert.deepEqual(response, expected, 'Resource poster did not return the expected http response');
    });

    it('testResourcePoster(Object handlerPayload, function responseTransformerCallback) - should return 500 http response with resource not created', function () {
        var resourceName = 'random';

        var newPeopleObject = {
            id: 0,
            firstName: 'Jack',
            lastName: 'Smith'
        };

        var handlerPayload = new HandlerPayload(
          {body: newPeopleObject},
          makeHandlerLookup({$resourceName: resourceName}),
          makeParameterMapper());

        var response = resourcePoster(handlerPayload);

        var failedOperationResponse = {operation:'post-resource',result:'can not save the new resource'};

        var expected = new HandlerResponse(500, httpHeaders, JSON.stringify(failedOperationResponse), resourceName);

        assert.deepEqual(response, expected, 'Resource poster did not return the expected http response when there is an internal server error');
    });


});
