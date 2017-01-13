var uniloc = require('uniloc-michr-fork');
var defaultRoutes = require('./default.routes');
var defaultHandlers = require('./default.handlers');
var _ = require('underscore');
//uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }

var Handler = function(routes, routeHandlers, parameterMapper, urlParameterDateFormat){
    this.router = uniloc(_.extend(defaultRoutes,routes));
    this.routeHandlers = _.extend(defaultHandlers,routeHandlers);

    this.handle = function(request) {
        var handlerLookup = this.router.lookup(request.url, request.method);

        if(handlerLookup && handlerLookup.name) {
            var requestHandler = this.routeHandlers[handlerLookup.name];
            if (requestHandler) {
                return requestHandler(handlerLookup.options, parameterMapper, urlParameterDateFormat);
            }
        }

        return undefined;
    };
};

module.exports=Handler;
