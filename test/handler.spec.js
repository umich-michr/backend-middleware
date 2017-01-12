var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var requestType = require('../src/request.type');

var defaultRoutes={
    'getResource': 'GET /backend-middleware/:resource',
    'postResource': 'POST /backend-middleware/:resource'
};

var defaultHandlers={
    getResource: sinon.stub(),
    postResource: function(){return 'postResource'}
};

var dateFormat='MM:DD:YYYY';
var routes = {
    getContacts: 'GET /backend-middleware/contacts',
    postContact: 'POST /backend-middleware/contacts',
    editContact: 'GET /backend-middleware/contacts/:id/edit'
};

var handlers = {
    getContacts: sinon.stub(),
    postContact: function(){}
};

var Handler = proxyquire('../src/handler', {'./default.routes':defaultRoutes,'./default.handlers':defaultHandlers});

describe('Handler Provider should find handler for http request', function() {

    it('testGetHandler(Object request) - Default handler matching the request url and method', function() {
        var handler = new Handler(routes, handlers, dateFormat);

        var request = {
            url:'/backend-middleware/someresource',
            method:requestType.GET
        };

        var response = handler.handle(request);

        assert.isTrue(defaultHandlers.getResource.called);
    });

    it('testGetHandler(Object request) - No handler matching the request url or method', function() {
        var handler = new Handler(routes, handlers, dateFormat);

        var request = {
            url:'/backend-middleware/contacts/attr/name/john?pass=b',
            method:requestType.PUT
        };

        assert.isUndefined(handler.handle(request));
    });

    it('testGetHandler(Object request) - Request method matches but url does not match', function() {
        var handler = new Handler(routes, handlers, dateFormat);

        var request = {
            url:'/backend-middleware/contacts/attr/name/john?pass=b',
            method:requestType.GET
        };

        assert.isUndefined(handler.handle(request));
    });

    it('testGetHandler(Object request) - Request method does not match but url matches', function() {
        var handler = new Handler(routes, handlers, dateFormat);

        var request = {
            url:'/backend-middleware/contacts',
            method:requestType.PUT
        };

        assert.isUndefined(handler.handle(request));
    });

    it('testGetHandler(Object request) - Handler matching both request and url should return a handler', function() {
        var handler = new Handler(routes, handlers, dateFormat);

        var request = {
            url:'/backend-middleware/contacts',
            method:requestType.GET
        };

        var response = handler.handle(request);

        assert.isTrue(handlers.getContacts.called);
    });

});