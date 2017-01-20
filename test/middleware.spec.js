var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');

var config = {
    routes: {
        resource: 'GET /backend/:resource'
    },
    handlers: {
        resource: ' resourceGetter'
    },

    resourceAttributeUrlParameterMap: {
        resourceId: 'id'
    },

    urlParameterDateFormat: 'YYYY-MM-DD',
    dataFiles: {
        path: './data',
        extension: '.json'
    },
    resourceUrlParamMapFiles: {
        path: './data/resource-url-param-map',
        extension: '.url.param.map.json'
    },
    responseTransformerCallback: sinon.stub()
};

var mockedResourceDatabase = sinon.stub({
    start: function () {}
});
var mockedResourceDatabaseConstructor = sinon.stub().returns(mockedResourceDatabase);
var mockedResourceParameterMapper = {
    toResourceDaoQueryObject: function () {}
};
var MockedResourceParameterMapper = sinon.stub().returns(mockedResourceParameterMapper);

var dispatcher = function (routes, handlers, resourceParameterMapper, responseTransformerCallback) {
    assert.equal(config.routes, routes);
    assert.equal(config.handlers, handlers);
    assert.equal(mockedResourceParameterMapper, resourceParameterMapper);
    assert.equal(config.responseTransformerCallback, responseTransformerCallback);
};

var createBackendMiddlewareTest = function (dispatcherStub) {
    return proxyquire('../src/middleware', {
        './dispatcher': dispatcherStub,
        './database/resource.database': mockedResourceDatabaseConstructor,
        './handlers/resource.parameter.mapper': MockedResourceParameterMapper
    });
};

describe('BackendMiddleware function should process requests', function () {

    afterEach(function () {
        assert.isTrue(mockedResourceDatabaseConstructor.calledWith(mockedResourceParameterMapper, config.dataFiles.path, config.dataFiles.extension));
        assert.isTrue(mockedResourceDatabase.start.called);
        assert.isTrue(MockedResourceParameterMapper.calledWithExactly(config.urlParameterDateFormat, config.resourceUrlParamMapFiles.path, config.resourceUrlParamMapFiles.extension));
    });

    it('testConstructor - object should expose clients the helper classes, objects and functions',function(){

        var middlewareFactory = createBackendMiddlewareTest(dispatcher);
        var middleware = middlewareFactory.create(config);

        assert.strictEqual(middlewareFactory.HTTP_METHODS, require('../src/utils/http.methods'), 'should have made http methods enum available to clients');
        assert.strictEqual(middlewareFactory.HELPER_FUNCTIONS, require('../src/utils/helpers'), 'should have made helper function available to clients');
        assert.strictEqual(middlewareFactory.HandlerPayload,require('../src/handlers/handler.payload') , 'should have made http handler payload wrapper available to clients');
        assert.strictEqual(middlewareFactory.HandlerResponse, require('../src/handlers/handler.response'), 'should have made http response class used for writing to response stream available to clients');
        assert.strictEqual(middlewareFactory.UrlParser, require('../src/utils/url.parser'), 'should have made url parser class vailable to clients');
    });

    it('testMiddleware(Object config) - No handler matching request url', function () {
        dispatcher.prototype.dispatch = function () {
            return undefined;
        };

        var middleware = createBackendMiddlewareTest(dispatcher).create(config);
        var nextSpy = sinon.spy();

        middleware({}, {}, nextSpy);
        assert.isTrue(nextSpy.calledOnce);
    });

    it('testMiddleware(Object config) - Handler matching request without response headers', function () {
        dispatcher.prototype.dispatch = function () {
            return {
                statusCode: 200,
                body: {
                    body: 'body'
                }
            };
        };

        var middleware = createBackendMiddlewareTest(dispatcher).create(config);

        var nextSpy = sinon.spy();
        var res = {
            writeHead: function () {},
            write: function () {},
            end: function () {}
        };
        sinon.stub(res);

        middleware({}, res, nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.calledWith(200));
        assert.isTrue(res.write.calledWith({
            body: 'body'
        }));
        assert.isTrue(res.end.called);
    });

    it('testMiddleware(Object config) - Handler matching request without status code', function () {
        dispatcher.prototype.dispatch = function () {
            return {
                headers: {
                    headerName: 'header'
                },
                body: {
                    body: 'body'
                }
            };
        };

        var middleware = createBackendMiddlewareTest(dispatcher).create(config);

        var nextSpy = sinon.spy();
        var res = {
            writeHead: function () {},
            write: function () {},
            setHeader: function () {},
            end: function () {}
        };
        sinon.stub(res);

        middleware({}, res, nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.notCalled);
        assert.isTrue(res.setHeader.calledWith('headerName', 'header'));
        assert.isTrue(res.write.calledWith({
            body: 'body'
        }));
        assert.isTrue(res.end.called);
    });

    it('testMiddleware(Object config) - Handler matching request with status code and response headers', function () {
        dispatcher.prototype.dispatch = function () {
            return {
                headers: {
                    headerName: 'header'
                },
                statusCode: 200,
                body: {
                    body: 'body'
                }
            };
        };

        var middleware = createBackendMiddlewareTest(dispatcher).create(config);

        var nextSpy = sinon.spy();
        var res = {
            writeHead: function () {},
            write: function () {},
            setHeader: function () {},
            end: function () {}
        };
        sinon.stub(res);

        middleware({}, res, nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.calledWith(200));
        assert.isTrue(res.setHeader.calledWith('headerName', 'header'));
        assert.isTrue(res.write.calledWith({
            body: 'body'
        }));
        assert.isTrue(res.end.called);
    });

    it('testMiddleware(Object config) - Handler matching request without status code, response headers or body', function () {
        dispatcher.prototype.dispatch = function () {
            return {};
        };

        var middleware = createBackendMiddlewareTest(dispatcher).create(config);

        var nextSpy = sinon.spy();
        var res = {
            writeHead: function () {},
            write: function () {},
            setHeader: function () {},
            end: function () {}
        };
        sinon.stub(res);

        middleware({}, res, nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.notCalled);
        assert.isTrue(res.setHeader.notCalled);
        assert.isTrue(res.write.calledWith(''));
        assert.isTrue(res.end.called);
    });
});
