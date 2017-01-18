var uniloc = require('uniloc-michr-fork');
var defaultRoutes = require('./default.routes');
var defaultHandlers = require('./default.handlers');
var _ = require('underscore');
//uniloc lookup response: { name: handlerName, options: {query and/or url parameters} }

/**
 *
 * @param routes An object that maps routes as represented by http method and url fragments with query string combinations to function names that will handle those routes by returning stringified json objects and http headers
 * @param routeHandlers An object that maps route handling function names to functions.
 * @param parameterMapper An object that transforms url parameters and url query string parameters to an object dao could use to query in memory database
 * @param resourceTransformerCallback An optional user provided callback method that will transform the resource returned by the route handler to any other form before being returned to client. It should accept resource to be returned and url parameter value map to apply custom logic to transfor it into the other form the callback function will return.
 * @constructor
 */
var Handler = function (routes, routeHandlers, parameterMapper, resourceTransormerCallback) {
    this.router = uniloc(_.extend(defaultRoutes, routes));
    this.routeHandlers = _.extend(defaultHandlers, routeHandlers);

    this.handle = function (request) {
        var handlerLookup = this.router.lookup(request.url, request.method);

        if (handlerLookup && handlerLookup.name) {
            var requestHandler = this.routeHandlers[handlerLookup.name];
            if (requestHandler) {
                var handlerPayload = {request:request, urlParameters:handlerLookup.options};
                return requestHandler(handlerPayload, parameterMapper, resourceTransormerCallback);
            }
        }

        return undefined;
    };
};

module.exports = Handler;
