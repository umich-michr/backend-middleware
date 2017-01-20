var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var RequestType = require('../src/utils/http.methods.js');

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

var Dispatcher = proxyquire('../src/dispatcher', {
    './config/default.routes': defaultRoutes,
    './config/default.handlers': defaultHandlers
});

describe('Dispatcher should route the request from middleware to the correct request handlers', function () {

    it('testGetHandler(Object request) - Default handler matching the request url and method', function () {
        var dispatcher = new Dispatcher(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/getAll/someres',
            method: RequestType.GET
        };

        var handlerPayload = { request: { url: '/backend/getAll/someres', method: 'GET' },
            urlParameters: { resource: 'someres' },
            parameterMapper: {} };

        var response = dispatcher.dispatch(request);

        assert.isTrue(defaultHandlers.getResource.calledWithExactly(handlerPayload, undefined));
    });

    it('testGetHandler(Object request) - No handler matching the request url or method', function () {
        var dispatcher = new Dispatcher(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/contacts/attr/name/john?pass=b',
            method: RequestType.PUT
        };

        assert.isUndefined(dispatcher.dispatch(request));
    });

    it('testGetHandler(Object request) - Request method matches a handler but url does not match a handler', function () {
        var dispatcher = new Dispatcher(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/contacts/attr/name/john?pass=b',
            method: RequestType.GET
        };

        assert.isUndefined(dispatcher.dispatch(request));
    });

    it('testGetHandler(Object request) - Request method does not match any handler but url matches a handler', function () {
        var dispatcher = new Dispatcher(routes, handlers, parameterMapper);

        var request = {
            url: '/backend/contacts',
            method: RequestType.PUT
        };

        assert.isUndefined(dispatcher.dispatch(request));
    });

    it('testGetHandler(Object request) - Dispatcher should dispatch the handler payload to the handler matching the url and http method.', function () {
        var resourceTransormerCallback = sinon.spy();
        var dispatcher = new Dispatcher(routes, handlers, parameterMapper, resourceTransormerCallback);
        var request = {
            url: '/backend/contacts',
            method: RequestType.GET
        };

        //uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }
        var handlerPayload = { request: { url: '/backend/contacts', method: 'GET' },
            urlParameters: {},
            parameterMapper: {} };
        var response = dispatcher.dispatch(request);

        assert.isTrue(handlers.getContacts.calledWithExactly(handlerPayload, resourceTransormerCallback));
    });

});
