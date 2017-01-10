var assert = require('chai').assert;
var sinon = require('sinon');

var HandlerProvider = require('../src/handler.provider');

describe('Middleware function should process requests', function() {
    it('No handler matching request url', function() {

        //stub a constructor returned by require and used inside the object being tested STARTS
        var handlerProvider = function(routes, handlers, dateFormat) {
            this.handle=function(){
                return undefined;
            };
        };
        sinon.stub(require.cache[ require.resolve( '../src/handler.provider' ) ], 'exports', handlerProvider);

        sinon.stub(require,'constructor').withArgs('./handler.provider').returns(handlerProvider);
        //stub a constructor returned by require and used inside the object being tested ENDS

        var MiddleWare = require('../src/middleware');

        var middleWare = new MiddleWare({routes:'',handlers:'', urlParameterDateFormat:''});
        var nextSpy = sinon.spy();
        
        middleWare({},{},nextSpy);
        assert.isTrue(nextSpy.calledOnce);
    });

    it('Handler matching request without response headers', function() {

    });

    it('Handler matching request without status code', function() {

    });

    it('Handler matching request with status code and response headers', function() {

    });
});