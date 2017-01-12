var uniloc = require('uniloc-michr-fork');
var defaultRoutes = require('./default.routes');
var defaultHandlers = require('./default.handlers');
var _ = require('underscore');
//uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }

var Handler = function(routes, routeHandlers, urlParameterDateFormat){
    this.router = uniloc(_.extend(routes, defaultRoutes));
    this.routeHandlers = _.extend(routeHandlers, defaultHandlers);

    this.handle = function(request) {
        var handlerLookup = this.router.lookup(request.url, request.method);

        if(handlerLookup && handlerLookup.name) {
            var handler = this.routeHandlers[handlerLookup.name];
            if (handler) {
                return handler(handlerLookup.options);
            }
        }

        return undefined;
    };
};

module.exports=Handler;
