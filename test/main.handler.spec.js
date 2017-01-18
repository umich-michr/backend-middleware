var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var requestType = require('../src/request.type');

var defaultRoutes = {
    getResource: 'GET /backend/to_be_overwritten_by_user_provided_routes',
    postResource: 'POST /backend/:resource'
};

var defaultHandlers = {
    getResource: sinon.stub(),
    postResource: function () {
        return 'postResource'
    }
};

var routes = {
    getResource: 'GET /backend/getAll/:resource',
    getContacts: 'GET /backend/contacts',
    postContact: 'POST /backend/contacts',
    editContact: 'GET /backend/contacts/:id/edit'
};

var handlers = {
    getContacts: sinon.stub()
};

var parameterMapper = {};

var Handler = proxyquire('../src/main.handler', {
    './default.routes': defaultRoutes,
    './default.handlers': defaultHandlers
});

describe('Handler Provider should find handler for http request', function () {

    it('testGetHandler(Object request) - Default handler matching the request url and method', function () {
        var handler = new Handler(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/getAll/someres',
            method: requestType.GET
        };

        var handlerPayload = {"request":request,"urlParameters":{"resource":"someres"}};

        var response = handler.handle(request);

        assert.isTrue(defaultHandlers.getResource.calledWithExactly(handlerPayload, parameterMapper, undefined));
    });

    it('testGetHandler(Object request) - No handler matching the request url or method', function () {
        var handler = new Handler(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/contacts/attr/name/john?pass=b',
            method: requestType.PUT
        };

        assert.isUndefined(handler.handle(request));
    });

    it('testGetHandler(Object request) - Request method matches but url does not match', function () {
        var handler = new Handler(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/contacts/attr/name/john?pass=b',
            method: requestType.GET
        };

        assert.isUndefined(handler.handle(request));
    });

    it('testGetHandler(Object request) - Request method does not match but url matches', function () {
        var handler = new Handler(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/contacts',
            method: requestType.PUT
        };

        assert.isUndefined(handler.handle(request));
    });

    it('testGetHandler(Object request) - Handler matching both request and url should return a handler', function () {
        var resourceTransormerCallback = sinon.spy();
        var handler = new Handler(routes, handlers, parameterMapper, resourceTransormerCallback);
        var request = {
            url: '/backend/contacts',
            method: requestType.GET
        };

        //uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }
        var handlerPayload = {request:request, urlParameters:{}};

        var response = handler.handle(request);

        assert.isTrue(handlers.getContacts.calledWithExactly(handlerPayload, parameterMapper, resourceTransormerCallback));
    });

});
