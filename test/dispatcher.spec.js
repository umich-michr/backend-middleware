var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var RequestType = require('../src/utils/http.methods.js');
var makeParameterMapper = require('../src/handlers/resource.parameter.mapper');

var defaultRoutes;
var defaultHandlers;
var routes;
var handlers;
var parameterMapper;

var Dispatcher;

describe('Dispatcher should route the request from middleware to the correct request handlers', function () {

    beforeEach(function() {
        defaultRoutes = {
            getResource: 'GET /to_be_overwritten_by_user_provided_routes',
            postResource: 'POST /:resource'
        };

        defaultHandlers = {
            getResource: sinon.stub(),
            postResource: function () {
                return 'postResource'
            }
        };

        routes = {
            getResource: 'GET /getAll/:resource',
            getContacts: 'GET /contacts',
            postContact: 'POST /contacts',
            editContact: 'GET /contacts/:id/edit'
        };

        handlers = {
            getContacts: sinon.stub()
        };

        parameterMapper = makeParameterMapper();

        Dispatcher = proxyquire('../src/dispatcher', {
            './config/default.routes': defaultRoutes,
            './config/default.handlers': defaultHandlers
        });
    });

    it('testGetHandler(Object request) - Default handler matching the request url and method', function () {
        var dispatcherConfig = {
            routes:routes,
            routeHandlers:handlers,
            parameterMapper:parameterMapper,
            contextPath: '/'
        };
        var dispatcher = new Dispatcher(dispatcherConfig);

        var request = {
            url: '/getAll/someres',
            method: RequestType.GET
        };

            var handlerPayload = { request: { url: '/getAll/someres', method: 'GET' },
            urlParameters: { resource: 'someres' },
            parameterMapper: {} };

        var response = dispatcher.dispatch(request);

        assert.isTrue(defaultHandlers.getResource.calledWithMatch(handlerPayload, undefined));
    });

    it('testGetHandler(Object request) - Default handler matching the request url and method', function () {
        var contextPath = '//testContextPath';

        var dispatcherConfig = {
            routes:routes,
            routeHandlers:handlers,
            parameterMapper:parameterMapper,
            contextPath: contextPath
        };
        var dispatcher = new Dispatcher(dispatcherConfig);

        var request = {
            url: '///testContextPath/getAll/someres',
            method: RequestType.GET
        };

        var handlerPayload = { request: { url: '///testContextPath/getAll/someres', method: 'GET' },
            urlParameters: { resource: 'someres' },
            parameterMapper: {} };

        var response = dispatcher.dispatch(request);

        assert.isTrue(defaultHandlers.getResource.calledWithMatch(handlerPayload, undefined));
    });

    it('testGetHandler(Object request) - No handler matching the request url or method', function () {
        var dispatcherConfig = {
            routes:routes,
            routeHandlers:handlers,
            parameterMapper:parameterMapper
        };

        var dispatcher = new Dispatcher(dispatcherConfig);

        var request = {
            url: '/backend/contacts/attr/name/john?pass=b',
            method: RequestType.PUT
        };

        assert.isUndefined(dispatcher.dispatch(request));
    });

    it('testGetHandler(Object request) - Request method matches a handler but url does not match a handler', function () {
        var dispatcher = new Dispatcher(routes, handlers, parameterMapper);

        var request = {
            url: '/contacts/attr/name/john?pass=b',
            method: RequestType.GET
        };

        assert.isUndefined(dispatcher.dispatch(request));
    });

    it('testGetHandler(Object request) - Request method does not match any handler but url matches a handler', function () {
        var dispatcher = new Dispatcher(routes, handlers, parameterMapper);

        var request = {
            url: '/contacts',
            method: RequestType.PUT
        };

        assert.isUndefined(dispatcher.dispatch(request));
    });

    it('testGetHandler(Object request) - Dispatcher should dispatch the handler payload to the handler matching the url and http method.', function () {
        var responseTransformerCallback = {x:11};

        var dispatcherConfig = {
            routes:routes,
            routeHandlers:handlers,
            parameterMapper:parameterMapper,
            responseTransformerCallback: responseTransformerCallback,
            contextPath: '/'
        };
        var dispatcher = new Dispatcher(dispatcherConfig);

        var request = {
            url: '/contacts',
            method: RequestType.GET
        };

        //uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }
        var handlerPayload = {
            request: { url: '/contacts', method: 'GET' },
            urlParameters: {},
            parameterMapper: {}
        };
        var response = dispatcher.dispatch(request);

        sinon.assert.calledWithMatch(handlers.getContacts,
          handlerPayload,
          dispatcherConfig.responseTransformerCallback);
    });

    it('testGetHandler(Object request) - When request url does not start with user specified context path and user specified contextPath is not "/" then request should not be dispatched to middleware handlers', function () {
        var responseTransformerCallback = sinon.spy();

        var dispatcherConfig = {
            routes:routes,
            routeHandlers:handlers,
            parameterMapper:parameterMapper,
            responseTransformerCallback: responseTransformerCallback,
            contextPath: '//notMatching'
        };
        var dispatcher = new Dispatcher(dispatcherConfig);

        var request = {
            url: '/notMatchingA/contacts',
            method: RequestType.GET
        };

        //uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }
        var handlerPayload = { request: { url: '/contacts', method: 'GET' },
            urlParameters: {},
            parameterMapper: {} };
        var response = dispatcher.dispatch(request);

        assert.isUndefined(response);
    });

});
