var assert = require('chai').assert;
var proxyquire = require('proxyquire');
var sinon = require('sinon');

describe('Middleware function should process requests', function() {

    it('No handler matching request url', function() {

        //stub a constructor returned by require and used inside the object being tested STARTS
        var handlerProvider = function(routes, handlers, dateFormat) {
            this.handle=function(){
                return undefined;
            };
        };

        //stub a constructor returned by require and used inside the object being tested ENDS


        var MiddleWare = proxyquire('../src/middleware', {'./handler.provider':handlerProvider});

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();

        middleWare({},{},nextSpy);
        assert.isTrue(nextSpy.calledOnce);
    });

    it('Handler matching request without response headers', function() {
        //stub a constructor returned by require and used inside the object being tested STARTS
        var handlerProvider = function(routes, handlers, dateFormat) {
            this.handle=function(){
                return {statusCode: 200};
            };
        };

        var MiddleWare = proxyquire('../src/middleware', {'./handler.provider':handlerProvider});

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();
        var res = {writeHead:function(){},write:function(){}};
        sinon.stub(res);

        middleWare({},res,nextSpy);
        assert.isTrue(nextSpy.notCalled);
        assert.isTrue(res.writeHead.calledWith(200));
    });

    xit('Handler matching request without status code', function() {

    });

    xit('Handler matching request with status code and response headers', function() {

    });
});