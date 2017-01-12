var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');

describe('Middleware function should process requests', function() {

    it('testMiddleWare(Object config) - No handler matching request url', function() {
        var handler = function(routes, handlers, dateFormat) {
            this.handle=function(request){
                return undefined;
            };
        };

        var MiddleWare = proxyquire('../src/middleware', {'./handler':handler});

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();

        middleWare({},{},nextSpy);
        assert.isTrue(nextSpy.calledOnce);
    });

    it('testMiddleWare(Object config) - Handler matching request without response headers', function() {
        var handler = function(routes, handlers, dateFormat) {
            this.handle=function(request){
                return {statusCode: 200, body: {body: 'body'}};
            };
        };

        var MiddleWare = proxyquire('../src/middleware', {'./handler':handler});

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.calledWith(200));
        assert.isTrue(res.write.calledWith({body: 'body'}));
    });

    it('testMiddleWare(Object config) - Handler matching request without status code', function() {
        var handler = function(routes, handlers, dateFormat) {
            this.handle=function(request){
                return {headers: {headerName: 'header'}, body: {body: 'body'}};
            };
        };

        var MiddleWare = proxyquire('../src/middleware', {'./handler':handler});

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){},setHeader:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.notCalled);
        assert.isTrue(res.setHeader.calledWith('headerName', 'header'));
        assert.isTrue(res.write.calledWith({body: 'body'}));
    });

    it('testMiddleWare(Object config) - Handler matching request with status code and response headers', function() {
        var handler = function(routes, handlers, dateFormat) {
            this.handle=function(request){
                return {headers: {headerName: 'header'}, statusCode: 200, body: {body: 'body'}};
            };
        };

        var MiddleWare = proxyquire('../src/middleware', {'./handler':handler});

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){},setHeader:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.calledWith(200));
        assert.isTrue(res.setHeader.calledWith('headerName', 'header'));
        assert.isTrue(res.write.calledWith({body: 'body'}));
    });

    it('testMiddleWare(Object config) - Handler matching request without status code, response headers or body', function() {
        var handler = function(routes, handlers, dateFormat) {
            this.handle=function(request){
                return {};
            };
        };

        var MiddleWare = proxyquire('../src/middleware', {'./handler':handler});

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){},setHeader:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.notCalled);
        assert.isTrue(res.setHeader.notCalled);
        assert.isTrue(res.write.calledWith(''));
    });
});